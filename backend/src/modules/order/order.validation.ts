import { z } from "zod";
import { ORDER_STATUS } from "../../common/constants";

export const createOrderSchema = z.object({
  body: z.object({
    restaurantId: z.string().min(12),
    items: z.array(
      z.object({
        menuItemId: z.string().min(12),
        quantity: z.number().int().min(1),
      })
    ).min(1),
    deliveryAddress: z.string().min(3),
    location: z.object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]),
    }),
    paymentMethod: z.enum(["COD", "ONLINE", "WALLET", "PARTIAL_WALLET"]).optional(),
    useWalletAmount: z.number().min(0).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ orderId: z.string().min(12) }),
  body: z.object({
    status: z.enum([
      ORDER_STATUS.ACCEPTED,
      ORDER_STATUS.PREPARING,
      ORDER_STATUS.READY,
      ORDER_STATUS.PICKED_UP,
      ORDER_STATUS.ARRIVED,
      ORDER_STATUS.COMPLETED,
      ORDER_STATUS.CANCELLED,
    ]),
  }),
});
