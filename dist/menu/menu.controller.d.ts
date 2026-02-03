import { MenuService } from './menu.service';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuFilterDto } from './dto';
import { User } from '../users/entities/user.entity';
export declare class MenuController {
    private readonly menuService;
    constructor(menuService: MenuService);
    create(createMenuItemDto: CreateMenuItemDto, user: User): Promise<import("./entities/menu-item.entity").MenuItem>;
    findByRestaurant(restaurantId: string, filterDto: MenuFilterDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<import("./entities/menu-item.entity").MenuItem>>;
    getCategories(restaurantId: string): Promise<string[]>;
    findOne(id: string): Promise<import("./entities/menu-item.entity").MenuItem>;
    update(id: string, updateMenuItemDto: UpdateMenuItemDto, user: User): Promise<import("./entities/menu-item.entity").MenuItem>;
    toggleAvailability(id: string, user: User): Promise<import("./entities/menu-item.entity").MenuItem>;
    delete(id: string, user: User): Promise<void>;
}
