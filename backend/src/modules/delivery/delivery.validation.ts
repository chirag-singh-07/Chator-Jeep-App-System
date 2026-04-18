import { z } from "zod";

export const assignOrderSchema = z.object({
  params: z.object({ orderId: z.string().min(12) })
});

export const updateDeliveryStatusSchema = z.object({
  params: z.object({ orderId: z.string().min(12) }),
  body: z.object({ status: z.enum(["PICKED_UP", "DELIVERED"]) })
});

export const updateLocationSchema = z.object({
  body: z.object({ coordinates: z.tuple([z.number(), z.number()]) })
});
