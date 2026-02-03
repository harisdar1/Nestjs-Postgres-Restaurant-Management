export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// Valid state transitions - this is the STATE MACHINE pattern
// Each status maps to an array of statuses it can transition to
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [], // Terminal state - no transitions allowed
  [OrderStatus.CANCELLED]: [], // Terminal state - no transitions allowed
};

export function canTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
): boolean {
  return ORDER_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}
