import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsUUID('4', { message: 'Invalid menu item ID' })
  @IsNotEmpty({ message: 'Menu item ID is required' })
  menuItemId: string;

  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID('4', { message: 'Invalid restaurant ID' })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  restaurantId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsNotEmpty({ message: 'Delivery address is required' })
  deliveryAddress: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
