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
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const menu_item_entity_1 = require("./entities/menu-item.entity");
const restaurants_service_1 = require("../restaurants/restaurants.service");
const enums_1 = require("../common/enums");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let MenuService = class MenuService {
    menuItemRepository;
    restaurantsService;
    constructor(menuItemRepository, restaurantsService) {
        this.menuItemRepository = menuItemRepository;
        this.restaurantsService = restaurantsService;
    }
    async create(createMenuItemDto, user) {
        const restaurant = await this.restaurantsService.findOne(createMenuItemDto.restaurantId);
        this.checkRestaurantOwnership(restaurant.ownerId, user);
        const menuItem = this.menuItemRepository.create(createMenuItemDto);
        return this.menuItemRepository.save(menuItem);
    }
    async findByRestaurant(restaurantId, filterDto) {
        const { page = 1, limit = 10, search, category, isAvailable, minPrice, maxPrice } = filterDto;
        const skip = (page - 1) * limit;
        const where = { restaurantId };
        if (search) {
            where.name = (0, typeorm_2.Like)(`%${search}%`);
        }
        if (category) {
            where.category = category;
        }
        if (isAvailable !== undefined) {
            where.isAvailable = isAvailable;
        }
        if (minPrice !== undefined && maxPrice !== undefined) {
            where.price = (0, typeorm_2.Between)(minPrice, maxPrice);
        }
        else if (minPrice !== undefined) {
            where.price = (0, typeorm_2.MoreThanOrEqual)(minPrice);
        }
        else if (maxPrice !== undefined) {
            where.price = (0, typeorm_2.LessThanOrEqual)(maxPrice);
        }
        const [items, total] = await this.menuItemRepository.findAndCount({
            where,
            skip,
            take: limit,
            order: { category: 'ASC', name: 'ASC' },
        });
        return (0, pagination_dto_1.paginate)(items, total, page, limit);
    }
    async findOne(id) {
        const menuItem = await this.menuItemRepository.findOne({
            where: { id },
            relations: ['restaurant'],
        });
        if (!menuItem) {
            throw new common_1.NotFoundException('Menu item not found');
        }
        return menuItem;
    }
    async update(id, updateMenuItemDto, user) {
        const menuItem = await this.findOne(id);
        const restaurant = await this.restaurantsService.findOne(menuItem.restaurantId);
        this.checkRestaurantOwnership(restaurant.ownerId, user);
        Object.assign(menuItem, updateMenuItemDto);
        return this.menuItemRepository.save(menuItem);
    }
    async delete(id, user) {
        const menuItem = await this.findOne(id);
        const restaurant = await this.restaurantsService.findOne(menuItem.restaurantId);
        this.checkRestaurantOwnership(restaurant.ownerId, user);
        await this.menuItemRepository.delete(id);
    }
    async toggleAvailability(id, user) {
        const menuItem = await this.findOne(id);
        const restaurant = await this.restaurantsService.findOne(menuItem.restaurantId);
        this.checkRestaurantOwnership(restaurant.ownerId, user);
        menuItem.isAvailable = !menuItem.isAvailable;
        return this.menuItemRepository.save(menuItem);
    }
    async getCategories(restaurantId) {
        const items = await this.menuItemRepository
            .createQueryBuilder('item')
            .select('DISTINCT item.category', 'category')
            .where('item.restaurantId = :restaurantId', { restaurantId })
            .andWhere('item.category IS NOT NULL')
            .getRawMany();
        return items.map((item) => item.category);
    }
    checkRestaurantOwnership(ownerId, user) {
        if (user.role === enums_1.UserRole.ADMIN) {
            return;
        }
        if (ownerId !== user.id) {
            throw new common_1.ForbiddenException('You can only manage menu items for your own restaurants');
        }
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(menu_item_entity_1.MenuItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        restaurants_service_1.RestaurantsService])
], MenuService);
//# sourceMappingURL=menu.service.js.map