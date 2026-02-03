import { OrderStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { OrderItem } from './order-item.entity';
import { Review } from '../../reviews/entities/review.entity';
export declare class Order {
    id: string;
    status: OrderStatus;
    totalAmount: number;
    deliveryAddress: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    user: User;
    restaurantId: string;
    restaurant: Restaurant;
    items: OrderItem[];
    review: Review;
}
