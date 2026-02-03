"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDER_STATUS_TRANSITIONS = exports.OrderStatus = void 0;
exports.canTransition = canTransition;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PREPARING"] = "PREPARING";
    OrderStatus["READY"] = "READY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
exports.ORDER_STATUS_TRANSITIONS = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
    [OrderStatus.READY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
};
function canTransition(currentStatus, newStatus) {
    return exports.ORDER_STATUS_TRANSITIONS[currentStatus].includes(newStatus);
}
//# sourceMappingURL=order-status.enum.js.map