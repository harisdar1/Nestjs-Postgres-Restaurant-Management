import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderFilterDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { UserRole } from '../common/enums';
import { User } from '../users/entities/user.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Create order (any authenticated user)
  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.create(createOrderDto, user);
  }

  // Get own orders (any authenticated user)
  @Get('my-orders')
  async findMyOrders(
    @CurrentUser() user: User,
    @Query() filterDto: OrderFilterDto,
  ) {
    return this.ordersService.findUserOrders(user.id, filterDto);
  }

  // Get restaurant orders (RESTAURANT_OWNER or ADMIN)
  @Get('restaurant/:restaurantId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  async findRestaurantOrders(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @CurrentUser() user: User,
    @Query() filterDto: OrderFilterDto,
  ) {
    return this.ordersService.findRestaurantOrders(restaurantId, user, filterDto);
  }

  // Get single order
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const order = await this.ordersService.findOne(id);

    // Users can only see their own orders, owners can see their restaurant's orders
    if (user.role === UserRole.USER && order.userId !== user.id) {
      // Throw the same error to avoid leaking information
      throw new Error('Order not found');
    }

    return order;
  }

  // Update order status (RESTAURANT_OWNER or ADMIN)
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto, user);
  }

  // Cancel order (user can cancel their own pending orders)
  @Patch(':id/cancel')
  async cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.cancelOrder(id, user);
  }
}
