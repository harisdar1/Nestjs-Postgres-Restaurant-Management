import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class RestaurantFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string; // Search by name

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isOpen?: boolean;
}
