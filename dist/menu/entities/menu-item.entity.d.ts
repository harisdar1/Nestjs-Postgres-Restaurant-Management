import { Restaurant } from '../../restaurants/entities/restaurant.entity';
export declare class MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
    restaurantId: string;
    restaurant: Restaurant;
}
