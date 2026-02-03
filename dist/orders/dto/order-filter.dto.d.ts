import { PaginationDto } from '../../common/dto/pagination.dto';
import { OrderStatus } from '../../common/enums';
export declare class OrderFilterDto extends PaginationDto {
    status?: OrderStatus;
}
