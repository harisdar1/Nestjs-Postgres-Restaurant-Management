export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PREPARING = "PREPARING",
    READY = "READY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export declare const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]>;
export declare function canTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean;
