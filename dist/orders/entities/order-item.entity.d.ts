import { Order } from './order.entity';
export declare class OrderItem {
    id: string;
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
    orderId: string;
    order: Order;
}
