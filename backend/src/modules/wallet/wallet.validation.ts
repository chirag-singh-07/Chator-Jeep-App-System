import { z } from "zod";
import { DELIVERY_PAYOUT_METHOD, DELIVERY_PAYOUT_STATUS } from "./delivery-payout.model";

const bankMethodSchema = z.object({
  type: z.literal(DELIVERY_PAYOUT_METHOD.BANK_ACCOUNT),
  accountHolderName: z.string().min(2),
  accountNumber: z.string().min(6),
  ifscCode: z.string().min(4),
  bankName: z.string().min(2),
});

const upiMethodSchema = z.object({
  type: z.literal(DELIVERY_PAYOUT_METHOD.UPI),
  upiId: z.string().min(3),
});

export const createWithdrawalSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
  }),
});

export const createDeliveryPayoutSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    paymentMethod: z.union([bankMethodSchema, upiMethodSchema]),
  }),
});

export const processRestaurantWithdrawalSchema = z.object({
  params: z.object({
    id: z.string().min(12),
  }),
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    note: z.string().max(300).optional(),
  }),
});

export const processDeliveryPayoutSchema = z.object({
  params: z.object({
    id: z.string().min(12),
  }),
  body: z.object({
    status: z.enum([DELIVERY_PAYOUT_STATUS.APPROVED, DELIVERY_PAYOUT_STATUS.REJECTED]),
    note: z.string().max(300).optional(),
  }),
});
