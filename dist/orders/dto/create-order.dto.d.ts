export declare class OrderItemDto {
    menuItemId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    restaurantId: string;
    items: OrderItemDto[];
    deliveryAddress: string;
    notes?: string;
}
