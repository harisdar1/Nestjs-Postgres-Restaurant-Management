import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { CreateOrderDto, UpdateOrderStatusDto, OrderFilterDto } from './dto';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { User } from '../users/entities/user.entity';
import { PaginatedResult } from '../common/dto/pagination.dto';
export declare class OrdersService {
    private orderRepository;
    private orderItemRepository;
    private menuItemRepository;
    private restaurantsService;
    private dataSource;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, menuItemRepository: Repository<MenuItem>, restaurantsService: RestaurantsService, dataSource: DataSource);
    create(createOrderDto: CreateOrderDto, user: User): Promise<Order>;
    findUserOrders(userId: string, filterDto: OrderFilterDto): Promise<PaginatedResult<Order>>;
    findRestaurantOrders(restaurantId: string, user: User, filterDto: OrderFilterDto): Promise<PaginatedResult<Order>>;
    private findOrders;
    findOne(id: string): Promise<Order>;
    updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto, user: User): Promise<Order>;
    cancelOrder(id: string, user: User): Promise<Order>;
    private checkStatusUpdatePermission;
}
