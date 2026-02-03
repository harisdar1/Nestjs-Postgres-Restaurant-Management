import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantFilterDto,
} from './dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums';
import { paginate, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) {}

  async create(
    createRestaurantDto: CreateRestaurantDto,
    owner: User,
  ): Promise<Restaurant> {
    const restaurant = this.restaurantRepository.create({
      ...createRestaurantDto,
      ownerId: owner.id,
    });

    return this.restaurantRepository.save(restaurant);
  }

  async findAll(
    filterDto: RestaurantFilterDto,
  ): Promise<PaginatedResult<Restaurant>> {
    const { page = 1, limit = 10, search, isOpen } = filterDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Restaurant> = {};

    if (search) {
      where.name = Like(`%${search}%`);
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

    return paginate(restaurants, total, page, limit);
  }

  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['owner', 'menuItems'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async findByOwner(ownerId: string): Promise<Restaurant[]> {
    return this.restaurantRepository.find({
      where: { ownerId },
      relations: ['menuItems'],
    });
  }

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
    user: User,
  ): Promise<Restaurant> {
    const restaurant = await this.findOne(id);

    // NEW PATTERN: Ownership check
    // Only the owner or admin can update
    this.checkOwnership(restaurant, user);

    Object.assign(restaurant, updateRestaurantDto);
    return this.restaurantRepository.save(restaurant);
  }

  async delete(id: string, user: User): Promise<void> {
    const restaurant = await this.findOne(id);

    // Ownership check
    this.checkOwnership(restaurant, user);

    await this.restaurantRepository.delete(id);
  }

  async toggleStatus(id: string, user: User): Promise<Restaurant> {
    const restaurant = await this.findOne(id);

    this.checkOwnership(restaurant, user);

    restaurant.isOpen = !restaurant.isOpen;
    return this.restaurantRepository.save(restaurant);
  }

  // NEW PATTERN: Ownership check helper
  // Throws ForbiddenException if user is not owner or admin
  private checkOwnership(restaurant: Restaurant, user: User): void {
    if (user.role === UserRole.ADMIN) {
      return; // Admins can do anything
    }

    if (restaurant.ownerId !== user.id) {
      throw new ForbiddenException('You can only modify your own restaurants');
    }
  }

  // Used by other services to verify restaurant exists and is open
  async findOpenRestaurant(id: string): Promise<Restaurant> {
    const restaurant = await this.findOne(id);

    if (!restaurant.isOpen) {
      throw new ForbiddenException('Restaurant is currently closed');
    }

    return restaurant;
  }
}
