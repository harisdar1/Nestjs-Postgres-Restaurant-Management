import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Like,
  FindOptionsWhere,
  MoreThanOrEqual,
  LessThanOrEqual,
  Between,
} from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuFilterDto } from './dto';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums';
import { paginate, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    private restaurantsService: RestaurantsService,
  ) {}

  async create(
    createMenuItemDto: CreateMenuItemDto,
    user: User,
  ): Promise<MenuItem> {
    // Verify restaurant exists and user owns it
    const restaurant = await this.restaurantsService.findOne(
      createMenuItemDto.restaurantId,
    );

    this.checkRestaurantOwnership(restaurant.ownerId, user);

    const menuItem = this.menuItemRepository.create(createMenuItemDto);
    return this.menuItemRepository.save(menuItem);
  }

  async findByRestaurant(
    restaurantId: string,
    filterDto: MenuFilterDto,
  ): Promise<PaginatedResult<MenuItem>> {
    const { page = 1, limit = 10, search, category, isAvailable, minPrice, maxPrice } =
      filterDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<MenuItem> = { restaurantId };

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (category) {
      where.category = category;
    }

    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }

    // Price filtering
    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      where.price = MoreThanOrEqual(minPrice);
    } else if (maxPrice !== undefined) {
      where.price = LessThanOrEqual(maxPrice);
    }

    const [items, total] = await this.menuItemRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { category: 'ASC', name: 'ASC' },
    });

    return paginate(items, total, page, limit);
  }

  async findOne(id: string): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    return menuItem;
  }

  async update(
    id: string,
    updateMenuItemDto: UpdateMenuItemDto,
    user: User,
  ): Promise<MenuItem> {
    const menuItem = await this.findOne(id);

    // Check ownership via restaurant
    const restaurant = await this.restaurantsService.findOne(
      menuItem.restaurantId,
    );
    this.checkRestaurantOwnership(restaurant.ownerId, user);

    Object.assign(menuItem, updateMenuItemDto);
    return this.menuItemRepository.save(menuItem);
  }

  async delete(id: string, user: User): Promise<void> {
    const menuItem = await this.findOne(id);

    // Check ownership via restaurant
    const restaurant = await this.restaurantsService.findOne(
      menuItem.restaurantId,
    );
    this.checkRestaurantOwnership(restaurant.ownerId, user);

    await this.menuItemRepository.delete(id);
  }

  async toggleAvailability(id: string, user: User): Promise<MenuItem> {
    const menuItem = await this.findOne(id);

    const restaurant = await this.restaurantsService.findOne(
      menuItem.restaurantId,
    );
    this.checkRestaurantOwnership(restaurant.ownerId, user);

    menuItem.isAvailable = !menuItem.isAvailable;
    return this.menuItemRepository.save(menuItem);
  }

  // Get categories for a restaurant (for filtering UI)
  async getCategories(restaurantId: string): Promise<string[]> {
    const items = await this.menuItemRepository
      .createQueryBuilder('item')
      .select('DISTINCT item.category', 'category')
      .where('item.restaurantId = :restaurantId', { restaurantId })
      .andWhere('item.category IS NOT NULL')
      .getRawMany();

    return items.map((item) => item.category);
  }

  private checkRestaurantOwnership(ownerId: string, user: User): void {
    if (user.role === UserRole.ADMIN) {
      return;
    }

    if (ownerId !== user.id) {
      throw new ForbiddenException(
        'You can only manage menu items for your own restaurants',
      );
    }
  }
}
