import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class RestaurantFilterDto extends PaginationDto {
    search?: string;
    isOpen?: boolean;
}
