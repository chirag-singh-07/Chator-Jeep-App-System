import crypto from "crypto";
import { AppError } from "../../common/errors/app-error";

let Razorpay: any = null;

const getRazorpay = () => {
  if (!Razorpay) {
    try {
      const RazorpaySDK = require("razorpay");
      Razorpay = new RazorpaySDK({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });
    } catch {
      throw new AppError("Razorpay SDK not available", 500);
    }
  }
  return Razorpay;
};

/** Create a Razorpay order (called before showing checkout) */
export const createRazorpayOrder = async (
  amount: number, // in rupees
  currency = "INR",
  receipt: string,
  notes?: Record<string, string>
) => {
  const rzp = getRazorpay();
  const order = await rzp.orders.create({
    amount: Math.round(amount * 100), // paise
    currency,
    receipt,
    notes,
  });
  return order;
};

/** Verify Razorpay payment signature — MUST call on backend before marking PAID */
export const verifyRazorpayPayment = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean => {
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  if (!secret) throw new AppError("Razorpay secret not configured", 500);

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === razorpaySignature;
};

/** Create a Razorpay payout (for restaurant/delivery partner payouts) */
export const createRazorpayPayout = async (input: {
  accountNumber: string;
  ifsc: string;
  amount: number; // rupees
  name: string;
  purpose: string;
  referenceId: string;
}) => {
  const rzp = getRazorpay();
  return rzp.payouts.create({
    account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
    fund_account: {
      account_type: "bank_account",
      bank_account: {
        name: input.name,
        ifsc: input.ifsc,
        account_number: input.accountNumber,
      },
    },
    amount: Math.round(input.amount * 100),
    currency: "INR",
    mode: "NEFT",
    purpose: input.purpose,
    reference_id: input.referenceId,
    queue_if_low_balance: true,
  });
};
