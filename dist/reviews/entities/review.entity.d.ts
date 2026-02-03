import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Order } from '../../orders/entities/order.entity';
export declare class Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    user: User;
    restaurantId: string;
    restaurant: Restaurant;
    orderId: string;
    order: Order;
}
