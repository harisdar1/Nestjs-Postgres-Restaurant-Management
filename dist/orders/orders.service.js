"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const menu_item_entity_1 = require("../menu/entities/menu-item.entity");
const restaurants_service_1 = require("../restaurants/restaurants.service");
const enums_1 = require("../common/enums");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let OrdersService = class OrdersService {
    orderRepository;
    orderItemRepository;
    menuItemRepository;
    restaurantsService;
    dataSource;
    constructor(orderRepository, orderItemRepository, menuItemRepository, restaurantsService, dataSource) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.restaurantsService = restaurantsService;
        this.dataSource = dataSource;
    }
    async create(createOrderDto, user) {
        const { restaurantId, items, deliveryAddress, notes } = createOrderDto;
        await this.restaurantsService.findOpenRestaurant(restaurantId);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const menuItemIds = items.map((item) => item.menuItemId);
            const menuItems = await this.menuItemRepository
                .createQueryBuilder('item')
                .where('item.id IN (:...ids)', { ids: menuItemIds })
                .andWhere('item.restaurantId = :restaurantId', { restaurantId })
                .getMany();
            if (menuItems.length !== menuItemIds.length) {
                throw new common_1.BadRequestException('Some menu items not found or do not belong to this restaurant');
            }
            const unavailableItems = menuItems.filter((item) => !item.isAvailable);
            if (unavailableItems.length > 0) {
                throw new common_1.BadRequestException(`These items are not available: ${unavailableItems.map((i) => i.name).join(', ')}`);
            }
            const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));
            let totalAmount = 0;
            const orderItems = [];
            for (const item of items) {
                const menuItem = menuItemMap.get(item.menuItemId);
                const subtotal = Number(menuItem.price) * item.quantity;
                totalAmount += subtotal;
                orderItems.push({
                    menuItemId: menuItem.id,
                    name: menuItem.name,
                    price: menuItem.price,
                    quantity: item.quantity,
                    subtotal,
                });
            }
            const order = queryRunner.manager.create(order_entity_1.Order, {
                userId: user.id,
                restaurantId,
                totalAmount,
                deliveryAddress,
                notes,
                status: enums_1.OrderStatus.PENDING,
            });
            const savedOrder = await queryRunner.manager.save(order);
            const orderItemEntities = orderItems.map((item) => queryRunner.manager.create(order_item_entity_1.OrderItem, {
                ...item,
                orderId: savedOrder.id,
            }));
            await queryRunner.manager.save(orderItemEntities);
            await queryRunner.commitTransaction();
            return this.findOne(savedOrder.id);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findUserOrders(userId, filterDto) {
        return this.findOrders({ userId }, filterDto);
    }
    async findRestaurantOrders(restaurantId, user, filterDto) {
        const restaurant = await this.restaurantsService.findOne(restaurantId);
        if (user.role !== enums_1.UserRole.ADMIN && restaurant.ownerId !== user.id) {
            throw new common_1.ForbiddenException('You can only view orders for your own restaurants');
        }
        return this.findOrders({ restaurantId }, filterDto);
    }
    async findOrders(whereBase, filterDto) {
        const { page = 1, limit = 10, status } = filterDto;
        const skip = (page - 1) * limit;
        const where = { ...whereBase };
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
        return (0, pagination_dto_1.paginate)(orders, total, page, limit);
    }
    async findOne(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['items', 'restaurant', 'user', 'review'],
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async updateStatus(id, updateStatusDto, user) {
        const order = await this.findOne(id);
        const { status: newStatus } = updateStatusDto;
        await this.checkStatusUpdatePermission(order, user);
        if (!(0, enums_1.canTransition)(order.status, newStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${order.status} to ${newStatus}`);
        }
        order.status = newStatus;
        return this.orderRepository.save(order);
    }
    async cancelOrder(id, user) {
        const order = await this.findOne(id);
        if (user.role === enums_1.UserRole.USER && order.userId !== user.id) {
            throw new common_1.ForbiddenException('You can only cancel your own orders');
        }
        if (!(0, enums_1.canTransition)(order.status, enums_1.OrderStatus.CANCELLED)) {
            throw new common_1.BadRequestException(`Cannot cancel order with status ${order.status}`);
        }
        order.status = enums_1.OrderStatus.CANCELLED;
        return this.orderRepository.save(order);
    }
    async checkStatusUpdatePermission(order, user) {
        if (user.role === enums_1.UserRole.ADMIN) {
            return;
        }
        if (user.role === enums_1.UserRole.RESTAURANT_OWNER) {
            const restaurant = await this.restaurantsService.findOne(order.restaurantId);
            if (restaurant.ownerId !== user.id) {
                throw new common_1.ForbiddenException('You can only update orders for your own restaurants');
            }
            return;
        }
        throw new common_1.ForbiddenException('You are not allowed to update order status');
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(menu_item_entity_1.MenuItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        restaurants_service_1.RestaurantsService,
        typeorm_2.DataSource])
], OrdersService);
//# sourceMappingURL=orders.service.js.map