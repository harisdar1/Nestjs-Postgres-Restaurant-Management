import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Item name is required' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be positive' })
  price: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsUUID('4', { message: 'Invalid restaurant ID' })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  restaurantId: string;
}
