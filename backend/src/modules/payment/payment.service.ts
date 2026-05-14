import { randomUUID } from "crypto";
import { AppError } from "../../common/errors/app-error";
import { getSetting } from "../system/system.service";
import { createRazorpayOrder, verifyRazorpayPayment, verifyRazorpayWebhookSignature } from "./razorpay.service";
import { PaymentTransaction } from "./payment.model";

export const getPaymentInfo = () => ({
  activeGateway: "RAZORPAY",
  availableGateways: ["RAZORPAY"],
  businessName: "Chatori Jeeb",
});

export const getRestaurantRegistrationPlan = async () => {
  const config = await getSetting("RESTAURANT_REGISTRATION_PRICING", {
    launchOfferFee: 299,
    standardFee: 999,
    launchCommissionPercentage: 10,
    normalCommissionPercentage: 10,
    offerWindowHours: 48,
    launchOfferActive: true,
  });

  const launchOfferActive = config.launchOfferActive !== false;
  const fee = launchOfferActive
    ? Number(config.launchOfferFee || 299)
    : Number(config.standardFee || 999);
  const standardFee = Number(config.standardFee || 999);

  return {
    name: launchOfferActive ? "Chatori Jeeb Launch Offer" : "Chatori Jeeb Standard Plan",
    registrationFee: fee,
    originalRegistrationFee: standardFee,
    launchCommissionPercentage: 10,
    normalCommissionPercentage: 10,
    offerWindowHours: Number(config.offerWindowHours || 48),
    launchOfferActive,
    currency: "INR",
  };
};

export const createRestaurantRegistrationOrder = async (metadata?: Record<string, string>) => {
  const plan = await getRestaurantRegistrationPlan();
  const receipt = `cj_rest_${Date.now()}_${randomUUID().slice(0, 8)}`;

  const order = await createRazorpayOrder(plan.registrationFee, "INR", receipt, {
    purpose: "RESTAURANT_REGISTRATION",
    businessName: "Chatori Jeeb",
    planName: plan.name,
    ...(metadata || {}),
  });

  const transaction = await PaymentTransaction.create({
    purpose: "RESTAURANT_REGISTRATION",
    status: "CREATED",
    amount: plan.registrationFee,
    currency: "INR",
    receipt,
    razorpayOrderId: order.id,
    plan: {
      name: plan.name,
      registrationFee: plan.registrationFee,
      launchCommissionPercentage: plan.launchCommissionPercentage,
      normalCommissionPercentage: plan.normalCommissionPercentage,
      offerWindowHours: plan.offerWindowHours,
    },
    metadata,
  });

  return {
    transactionId: transaction._id.toString(),
    razorpayOrderId: order.id,
    amount: transaction.amount,
    currency: transaction.currency,
    receipt,
    plan,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
};

export const verifyRestaurantRegistrationPayment = async (input: {
  transactionId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) => {
  const transaction = await PaymentTransaction.findOne({
    _id: input.transactionId,
    razorpayOrderId: input.razorpayOrderId,
    purpose: "RESTAURANT_REGISTRATION",
  });

  if (!transaction) throw new AppError("Payment transaction not found", 404);
  if (transaction.status === "CONSUMED") throw new AppError("Payment already used", 409);

  const isValid = verifyRazorpayPayment(
    input.razorpayOrderId,
    input.razorpayPaymentId,
    input.razorpaySignature,
  );

  if (!isValid) {
    await PaymentTransaction.findByIdAndUpdate(transaction._id, {
      status: "FAILED",
      failedAt: new Date(),
      failureReason: "Invalid Razorpay signature",
    });
    throw new AppError("Payment verification failed", 400);
  }

  transaction.status = "PAID";
  transaction.razorpayPaymentId = input.razorpayPaymentId;
  transaction.razorpaySignature = input.razorpaySignature;
  transaction.paidAt = new Date();
  await transaction.save();

  console.log("[payment] restaurant registration payment verified", {
    transactionId: transaction._id.toString(),
    razorpayOrderId: transaction.razorpayOrderId,
    razorpayPaymentId: transaction.razorpayPaymentId,
  });

  return {
    transactionId: transaction._id.toString(),
    paymentStatus: transaction.status,
    paymentTimestamp: transaction.paidAt,
    plan: transaction.plan,
  };
};

export const consumeRestaurantRegistrationPayment = async (
  transactionId: string,
  restaurantId: string,
) => {
  const transaction = restaurantId
    ? await PaymentTransaction.findOneAndUpdate(
        {
          _id: transactionId,
          purpose: "RESTAURANT_REGISTRATION",
          status: "PAID",
        },
        {
          status: "CONSUMED",
          consumedByRestaurantId: restaurantId,
          consumedAt: new Date(),
        },
        { new: true },
      )
    : await PaymentTransaction.findOne({
        _id: transactionId,
        purpose: "RESTAURANT_REGISTRATION",
        status: "PAID",
      });

  if (!transaction) {
    throw new AppError("A verified registration payment is required", 402);
  }

  return transaction;
};

export const handleRazorpayWebhook = async (rawBody: string, signature: string, payload: any) => {
  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    throw new AppError("Invalid Razorpay webhook signature", 400);
  }

  const orderId = payload?.payload?.payment?.entity?.order_id;
  const paymentId = payload?.payload?.payment?.entity?.id;
  const event = payload?.event;

  if (!orderId) return { received: true };

  const update =
    event === "payment.failed"
      ? { status: "FAILED", failedAt: new Date(), failureReason: payload?.payload?.payment?.entity?.error_description }
      : event === "payment.captured" || event === "payment.authorized"
        ? { status: "PAID", paidAt: new Date(), razorpayPaymentId: paymentId }
        : null;

  if (update) {
    await PaymentTransaction.findOneAndUpdate({ razorpayOrderId: orderId }, update);
    console.log("[payment] razorpay webhook processed", { event, orderId, paymentId });
  }

  return { received: true };
};

export const renderPhonePeRedirectPage = (targetUrl?: string, merchantOrderId?: string) => {
  const safeTargetUrl = targetUrl && /^[-a-zA-Z0-9+&@#/%?=~_|!:,.;()]+$/.test(targetUrl) ? targetUrl : null;
  const nextUrl = safeTargetUrl || null;
  const fallbackText = merchantOrderId
    ? `Payment finished for order ${merchantOrderId}. You can return to the app now.`
    : "Payment finished. You can return to the app now.";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Returning to app...</title>
    ${nextUrl ? `<meta http-equiv="refresh" content="0;url=${nextUrl}" />` : ""}
    <style>
      body { font-family: Arial, sans-serif; background: #fff7ed; color: #7c2d12; margin: 0; min-height: 100vh; display: grid; place-items: center; }
      main { max-width: 420px; padding: 24px; text-align: center; }
      a { color: #ea580c; font-weight: 700; }
    </style>
  </head>
  <body>
    <main>
      <h1>Returning to the app...</h1>
      <p>${fallbackText}</p>
      ${nextUrl ? `<p><a href="${nextUrl}">Tap here if the app does not open automatically.</a></p>` : ""}
    </main>
    ${nextUrl ? `<script>window.location.replace(${JSON.stringify(nextUrl)});</script>` : ""}
  </body>
</html>`;
};
