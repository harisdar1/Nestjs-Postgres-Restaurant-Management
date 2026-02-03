import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Create review (authenticated users only)
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.create(createReviewDto, user);
  }

  // Get reviews for a restaurant (PUBLIC)
  @Get('restaurant/:restaurantId')
  async findByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.reviewsService.findByRestaurant(restaurantId, paginationDto);
  }

  // Get single review (PUBLIC)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.findOne(id);
  }

  // Update review (author only)
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.update(id, updateReviewDto, user);
  }

  // Delete review (author or admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.delete(id, user);
  }
}
