import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto, UpdateRestaurantDto, RestaurantFilterDto } from './dto';
import { User } from '../users/entities/user.entity';
import { PaginatedResult } from '../common/dto/pagination.dto';
export declare class RestaurantsService {
    private restaurantRepository;
    constructor(restaurantRepository: Repository<Restaurant>);
    create(createRestaurantDto: CreateRestaurantDto, owner: User): Promise<Restaurant>;
    findAll(filterDto: RestaurantFilterDto): Promise<PaginatedResult<Restaurant>>;
    findOne(id: string): Promise<Restaurant>;
    findByOwner(ownerId: string): Promise<Restaurant[]>;
    update(id: string, updateRestaurantDto: UpdateRestaurantDto, user: User): Promise<Restaurant>;
    delete(id: string, user: User): Promise<void>;
    toggleStatus(id: string, user: User): Promise<Restaurant>;
    private checkOwnership;
    findOpenRestaurant(id: string): Promise<Restaurant>;
}
