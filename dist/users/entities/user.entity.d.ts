import { UserRole } from '../../common/enums';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Order } from '../../orders/entities/order.entity';
import { Review } from '../../reviews/entities/review.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    name: string;
    phone: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    restaurants: Restaurant[];
    orders: Order[];
    reviews: Review[];
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
}
