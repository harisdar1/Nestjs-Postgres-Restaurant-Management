import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
