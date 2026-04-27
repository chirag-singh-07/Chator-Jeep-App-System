export const ORDER_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  PREPARING: "PREPARING",
  READY: "READY",
  PICKED_UP: "PICKED_UP",
  ARRIVED: "ARRIVED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  UNPAID: "UNPAID",
  PAID: "PAID",
  REFUNDED: "REFUNDED"
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
