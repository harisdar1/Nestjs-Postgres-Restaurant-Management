import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty({ message: 'Restaurant name is required' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}
