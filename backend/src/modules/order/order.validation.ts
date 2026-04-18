import { z } from "zod";
import { ORDER_STATUS } from "../../common/constants";

export const createOrderSchema = z.object({
  body: z.object({
    kitchenId: z.string().min(12),
    items: z.array(z.object({ menuItemId: z.string().min(12), quantity: z.number().int().min(1) })).min(1)
  })
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ orderId: z.string().min(12) }),
  body: z.object({
    status: z.enum([
      ORDER_STATUS.ACCEPTED,
      ORDER_STATUS.PREPARING,
      ORDER_STATUS.READY,
      ORDER_STATUS.OUT_FOR_DELIVERY,
      ORDER_STATUS.DELIVERED,
      ORDER_STATUS.CANCELLED
    ])
  })
});
