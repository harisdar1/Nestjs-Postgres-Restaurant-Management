import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { CreateOrderDto, UpdateOrderStatusDto, OrderFilterDto } from './dto';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { User } from '../users/entities/user.entity';
import { UserRole, OrderStatus, canTransition } from '../common/enums';
import { paginate, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    private restaurantsService: RestaurantsService,
    private dataSource: DataSource, // For transactions
  ) {}

  // NEW PATTERN: Transaction with Price Snapshots
  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    const { restaurantId, items, deliveryAddress, notes } = createOrderDto;

    // Verify restaurant is open
    await this.restaurantsService.findOpenRestaurant(restaurantId);

    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Fetch all menu items and validate they exist and are available
      const menuItemIds = items.map((item) => item.menuItemId);
      const menuItems = await this.menuItemRepository
        .createQueryBuilder('item')
        .where('item.id IN (:...ids)', { ids: menuItemIds })
        .andWhere('item.restaurantId = :restaurantId', { restaurantId })
        .getMany();

      // Validate all items exist
      if (menuItems.length !== menuItemIds.length) {
        throw new BadRequestException(
          'Some menu items not found or do not belong to this restaurant',
        );
      }

      // Check availability
      const unavailableItems = menuItems.filter((item) => !item.isAvailable);
      if (unavailableItems.length > 0) {
        throw new BadRequestException(
          `These items are not available: ${unavailableItems.map((i) => i.name).join(', ')}`,
        );
      }

      // Create a map for easy lookup
      const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));

      // Calculate total and create order items with PRICE SNAPSHOTS
      let totalAmount = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const item of items) {
        const menuItem = menuItemMap.get(item.menuItemId)!;
        const subtotal = Number(menuItem.price) * item.quantity;
        totalAmount += subtotal;

        // PRICE SNAPSHOT: Copy the current price into the order
        orderItems.push({
          menuItemId: menuItem.id,
          name: menuItem.name, // Snapshot
          price: menuItem.price, // Snapshot - even if price changes later, this order keeps original price
          quantity: item.quantity,
          subtotal,
        });
      }

      // Create order
      const order = queryRunner.manager.create(Order, {
        userId: user.id,
        restaurantId,
        totalAmount,
        deliveryAddress,
        notes,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // Create order items
      const orderItemEntities = orderItems.map((item) =>
        queryRunner.manager.create(OrderItem, {
          ...item,
          orderId: savedOrder.id,
        }),
      );

      await queryRunner.manager.save(orderItemEntities);

      await queryRunner.commitTransaction();

      // Return order with items
      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Get user's own orders
  async findUserOrders(
    userId: string,
    filterDto: OrderFilterDto,
  ): Promise<PaginatedResult<Order>> {
    return this.findOrders({ userId }, filterDto);
  }

  // Get restaurant's orders (for owner)
  async findRestaurantOrders(
    restaurantId: string,
    user: User,
    filterDto: OrderFilterDto,
  ): Promise<PaginatedResult<Order>> {
    // Verify ownership
    const restaurant = await this.restaurantsService.findOne(restaurantId);
    if (user.role !== UserRole.ADMIN && restaurant.ownerId !== user.id) {
      throw new ForbiddenException(
        'You can only view orders for your own restaurants',
      );
    }

    return this.findOrders({ restaurantId }, filterDto);
  }

  private async findOrders(
    whereBase: FindOptionsWhere<Order>,
    filterDto: OrderFilterDto,
  ): Promise<PaginatedResult<Order>> {
    const { page = 1, limit = 10, status } = filterDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Order> = { ...whereBase };

    if (status) {
      where.status = status;
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['items', 'restaurant', 'user'],
    });

    return paginate(orders, total, page, limit);
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'restaurant', 'user', 'review'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // NEW PATTERN: State Machine for order status
  async updateStatus(
    id: string,
    updateStatusDto: UpdateOrderStatusDto,
    user: User,
  ): Promise<Order> {
    const order = await this.findOne(id);
    const { status: newStatus } = updateStatusDto;

    // Check permissions
    await this.checkStatusUpdatePermission(order, user);

    // STATE MACHINE: Validate transition
    if (!canTransition(order.status, newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${newStatus}`,
      );
    }

    order.status = newStatus;
    return this.orderRepository.save(order);
  }

  // Cancel order (user can cancel their own pending orders)
  async cancelOrder(id: string, user: User): Promise<Order> {
    const order = await this.findOne(id);

    // Users can only cancel their own orders
    if (user.role === UserRole.USER && order.userId !== user.id) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    // Can only cancel if status allows it
    if (!canTransition(order.status, OrderStatus.CANCELLED)) {
      throw new BadRequestException(
        `Cannot cancel order with status ${order.status}`,
      );
    }

    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }

  private async checkStatusUpdatePermission(
    order: Order,
    user: User,
  ): Promise<void> {
    if (user.role === UserRole.ADMIN) {
      return; // Admins can update any order
    }

    // Restaurant owners can update their restaurant's orders
    if (user.role === UserRole.RESTAURANT_OWNER) {
      const restaurant = await this.restaurantsService.findOne(
        order.restaurantId,
      );
      if (restaurant.ownerId !== user.id) {
        throw new ForbiddenException(
          'You can only update orders for your own restaurants',
        );
      }
      return;
    }

    // Regular users cannot update order status (except cancel via separate endpoint)
    throw new ForbiddenException('You are not allowed to update order status');
  }
}
