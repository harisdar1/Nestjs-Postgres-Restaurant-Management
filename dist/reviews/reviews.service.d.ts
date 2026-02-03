import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Order } from '../orders/entities/order.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { User } from '../users/entities/user.entity';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
export declare class ReviewsService {
    private reviewRepository;
    private orderRepository;
    private restaurantRepository;
    constructor(reviewRepository: Repository<Review>, orderRepository: Repository<Order>, restaurantRepository: Repository<Restaurant>);
    create(createReviewDto: CreateReviewDto, user: User): Promise<Review>;
    findByRestaurant(restaurantId: string, paginationDto: PaginationDto): Promise<PaginatedResult<Review>>;
    findOne(id: string): Promise<Review>;
    update(id: string, updateReviewDto: UpdateReviewDto, user: User): Promise<Review>;
    delete(id: string, user: User): Promise<void>;
    private updateRestaurantRating;
}
