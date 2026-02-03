import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../../common/enums';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  @IsNotEmpty({ message: 'Status is required' })
  status: OrderStatus;
}
