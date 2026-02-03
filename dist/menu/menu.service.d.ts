import { Repository } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuFilterDto } from './dto';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { User } from '../users/entities/user.entity';
import { PaginatedResult } from '../common/dto/pagination.dto';
export declare class MenuService {
    private menuItemRepository;
    private restaurantsService;
    constructor(menuItemRepository: Repository<MenuItem>, restaurantsService: RestaurantsService);
    create(createMenuItemDto: CreateMenuItemDto, user: User): Promise<MenuItem>;
    findByRestaurant(restaurantId: string, filterDto: MenuFilterDto): Promise<PaginatedResult<MenuItem>>;
    findOne(id: string): Promise<MenuItem>;
    update(id: string, updateMenuItemDto: UpdateMenuItemDto, user: User): Promise<MenuItem>;
    delete(id: string, user: User): Promise<void>;
    toggleAvailability(id: string, user: User): Promise<MenuItem>;
    getCategories(restaurantId: string): Promise<string[]>;
    private checkRestaurantOwnership;
}
