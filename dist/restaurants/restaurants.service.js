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
exports.RestaurantsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_entity_1 = require("./entities/restaurant.entity");
const enums_1 = require("../common/enums");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let RestaurantsService = class RestaurantsService {
    restaurantRepository;
    constructor(restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }
    async create(createRestaurantDto, owner) {
        const restaurant = this.restaurantRepository.create({
            ...createRestaurantDto,
            ownerId: owner.id,
        });
        return this.restaurantRepository.save(restaurant);
    }
    async findAll(filterDto) {
        const { page = 1, limit = 10, search, isOpen } = filterDto;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.name = (0, typeorm_2.Like)(`%${search}%`);
        }
        if (isOpen !== undefined) {
            where.isOpen = isOpen;
        }
        const [restaurants, total] = await this.restaurantRepository.findAndCount({
            where,
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
            relations: ['owner'],
        });
        return (0, pagination_dto_1.paginate)(restaurants, total, page, limit);
    }
    async findOne(id) {
        const restaurant = await this.restaurantRepository.findOne({
            where: { id },
            relations: ['owner', 'menuItems'],
        });
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurant not found');
        }
        return restaurant;
    }
    async findByOwner(ownerId) {
        return this.restaurantRepository.find({
            where: { ownerId },
            relations: ['menuItems'],
        });
    }
    async update(id, updateRestaurantDto, user) {
        const restaurant = await this.findOne(id);
        this.checkOwnership(restaurant, user);
        Object.assign(restaurant, updateRestaurantDto);
        return this.restaurantRepository.save(restaurant);
    }
    async delete(id, user) {
        const restaurant = await this.findOne(id);
        this.checkOwnership(restaurant, user);
        await this.restaurantRepository.delete(id);
    }
    async toggleStatus(id, user) {
        const restaurant = await this.findOne(id);
        this.checkOwnership(restaurant, user);
        restaurant.isOpen = !restaurant.isOpen;
        return this.restaurantRepository.save(restaurant);
    }
    checkOwnership(restaurant, user) {
        if (user.role === enums_1.UserRole.ADMIN) {
            return;
        }
        if (restaurant.ownerId !== user.id) {
            throw new common_1.ForbiddenException('You can only modify your own restaurants');
        }
    }
    async findOpenRestaurant(id) {
        const restaurant = await this.findOne(id);
        if (!restaurant.isOpen) {
            throw new common_1.ForbiddenException('Restaurant is currently closed');
        }
        return restaurant;
    }
};
exports.RestaurantsService = RestaurantsService;
exports.RestaurantsService = RestaurantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RestaurantsService);
//# sourceMappingURL=restaurants.service.js.map