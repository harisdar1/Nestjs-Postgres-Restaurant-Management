import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(createReviewDto: CreateReviewDto, user: User): Promise<import("./entities/review.entity").Review>;
    findByRestaurant(restaurantId: string, paginationDto: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<import("./entities/review.entity").Review>>;
    findOne(id: string): Promise<import("./entities/review.entity").Review>;
    update(id: string, updateReviewDto: UpdateReviewDto, user: User): Promise<import("./entities/review.entity").Review>;
    delete(id: string, user: User): Promise<void>;
}
