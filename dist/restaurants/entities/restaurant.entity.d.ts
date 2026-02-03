import { User } from '../../users/entities/user.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';
import { Order } from '../../orders/entities/order.entity';
import { Review } from '../../reviews/entities/review.entity';
export declare class Restaurant {
    id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    isOpen: boolean;
    averageRating: number;
    totalReviews: number;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
    owner: User;
    menuItems: MenuItem[];
    orders: Order[];
    reviews: Review[];
}
