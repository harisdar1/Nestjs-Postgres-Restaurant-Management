import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class MenuFilterDto extends PaginationDto {
    search?: string;
    category?: string;
    isAvailable?: boolean;
    minPrice?: number;
    maxPrice?: number;
}
