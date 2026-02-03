import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto, UpdateRestaurantDto, RestaurantFilterDto } from './dto';
import { User } from '../users/entities/user.entity';
export declare class RestaurantsController {
    private readonly restaurantsService;
    constructor(restaurantsService: RestaurantsService);
    create(createRestaurantDto: CreateRestaurantDto, user: User): Promise<import("./entities/restaurant.entity").Restaurant>;
    findAll(filterDto: RestaurantFilterDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<import("./entities/restaurant.entity").Restaurant>>;
    findMyRestaurants(user: User): Promise<import("./entities/restaurant.entity").Restaurant[]>;
    findOne(id: string): Promise<import("./entities/restaurant.entity").Restaurant>;
    update(id: string, updateRestaurantDto: UpdateRestaurantDto, user: User): Promise<import("./entities/restaurant.entity").Restaurant>;
    toggleStatus(id: string, user: User): Promise<import("./entities/restaurant.entity").Restaurant>;
    delete(id: string, user: User): Promise<void>;
}
