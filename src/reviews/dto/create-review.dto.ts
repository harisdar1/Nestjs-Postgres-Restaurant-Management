import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateReviewDto {
  @IsUUID('4', { message: 'Invalid order ID' })
  @IsNotEmpty({ message: 'Order ID is required' })
  orderId: string;

  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
