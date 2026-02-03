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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("./entities/review.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
const enums_1 = require("../common/enums");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let ReviewsService = class ReviewsService {
    reviewRepository;
    orderRepository;
    restaurantRepository;
    constructor(reviewRepository, orderRepository, restaurantRepository) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
        this.restaurantRepository = restaurantRepository;
    }
    async create(createReviewDto, user) {
        const { orderId, rating, comment } = createReviewDto;
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['review'],
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== user.id) {
            throw new common_1.ForbiddenException('You can only review your own orders');
        }
        if (order.status !== enums_1.OrderStatus.DELIVERED) {
            throw new common_1.BadRequestException('You can only review orders that have been delivered');
        }
        if (order.review) {
            throw new common_1.ConflictException('You have already reviewed this order');
        }
        const review = this.reviewRepository.create({
            orderId,
            userId: user.id,
            restaurantId: order.restaurantId,
            rating,
            comment,
        });
        const savedReview = await this.reviewRepository.save(review);
        await this.updateRestaurantRating(order.restaurantId);
        return savedReview;
    }
    async findByRestaurant(restaurantId, paginationDto) {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;
        const [reviews, total] = await this.reviewRepository.findAndCount({
            where: { restaurantId },
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
            relations: ['user'],
        });
        const sanitizedReviews = reviews.map((review) => ({
            ...review,
            user: {
                id: review.user.id,
                name: review.user.name,
            },
        }));
        return (0, pagination_dto_1.paginate)(sanitizedReviews, total, page, limit);
    }
    async findOne(id) {
        const review = await this.reviewRepository.findOne({
            where: { id },
            relations: ['user', 'restaurant', 'order'],
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return review;
    }
    async update(id, updateReviewDto, user) {
        const review = await this.findOne(id);
        if (review.userId !== user.id && user.role !== enums_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only update your own reviews');
        }
        Object.assign(review, updateReviewDto);
        const updatedReview = await this.reviewRepository.save(review);
        if (updateReviewDto.rating) {
            await this.updateRestaurantRating(review.restaurantId);
        }
        return updatedReview;
    }
    async delete(id, user) {
        const review = await this.findOne(id);
        if (review.userId !== user.id && user.role !== enums_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only delete your own reviews');
        }
        const restaurantId = review.restaurantId;
        await this.reviewRepository.delete(id);
        await this.updateRestaurantRating(restaurantId);
    }
    async updateRestaurantRating(restaurantId) {
        const result = await this.reviewRepository
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'average')
            .addSelect('COUNT(review.id)', 'count')
            .where('review.restaurantId = :restaurantId', { restaurantId })
            .getRawOne();
        const averageRating = result.average ? parseFloat(result.average) : 0;
        const totalReviews = parseInt(result.count, 10);
        await this.restaurantRepository.update(restaurantId, {
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map