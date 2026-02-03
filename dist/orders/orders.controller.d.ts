import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderFilterDto } from './dto';
import { User } from '../users/entities/user.entity';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, user: User): Promise<import("./entities/order.entity").Order>;
    findMyOrders(user: User, filterDto: OrderFilterDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<import("./entities/order.entity").Order>>;
    findRestaurantOrders(restaurantId: string, user: User, filterDto: OrderFilterDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<import("./entities/order.entity").Order>>;
    findOne(id: string, user: User): Promise<import("./entities/order.entity").Order>;
    updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto, user: User): Promise<import("./entities/order.entity").Order>;
    cancelOrder(id: string, user: User): Promise<import("./entities/order.entity").Order>;
}
