import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Order } from '../orders/entities/order.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { User } from '../users/entities/user.entity';
import { OrderStatus, UserRole } from '../common/enums';
import { PaginationDto, paginate, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) {}

  // NEW PATTERN: Delivery validation - can only review DELIVERED orders
  async create(createReviewDto: CreateReviewDto, user: User): Promise<Review> {
    const { orderId, rating, comment } = createReviewDto;

    // Find the order
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['review'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify the order belongs to this user
    if (order.userId !== user.id) {
      throw new ForbiddenException('You can only review your own orders');
    }

    // DELIVERY VALIDATION: Order must be DELIVERED
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'You can only review orders that have been delivered',
      );
    }

    // ONE REVIEW PER ORDER: Check if already reviewed
    if (order.review) {
      throw new ConflictException('You have already reviewed this order');
    }

    // Create review
    const review = this.reviewRepository.create({
      orderId,
      userId: user.id,
      restaurantId: order.restaurantId,
      rating,
      comment,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Update restaurant's average rating
    await this.updateRestaurantRating(order.restaurantId);

    return savedReview;
  }

  async findByRestaurant(
    restaurantId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Review>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { restaurantId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    // Sanitize user data in reviews
    const sanitizedReviews = reviews.map((review) => ({
      ...review,
      user: {
        id: review.user.id,
        name: review.user.name,
      },
    }));

    return paginate(sanitizedReviews as Review[], total, page, limit);
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'restaurant', 'order'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    user: User,
  ): Promise<Review> {
    const review = await this.findOne(id);

    // Only the author can update their review
    if (review.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    Object.assign(review, updateReviewDto);
    const updatedReview = await this.reviewRepository.save(review);

    // Update restaurant rating if rating changed
    if (updateReviewDto.rating) {
      await this.updateRestaurantRating(review.restaurantId);
    }

    return updatedReview;
  }

  async delete(id: string, user: User): Promise<void> {
    const review = await this.findOne(id);

    // Only the author or admin can delete
    if (review.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const restaurantId = review.restaurantId;
    await this.reviewRepository.delete(id);

    // Update restaurant rating
    await this.updateRestaurantRating(restaurantId);
  }

  // Update restaurant's average rating
  private async updateRestaurantRating(restaurantId: string): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.restaurantId = :restaurantId', { restaurantId })
      .getRawOne();

    const averageRating = result.average ? parseFloat(result.average) : 0;
    const totalReviews = parseInt(result.count, 10);

    await this.restaurantRepository.update(restaurantId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews,
    });
  }
}
