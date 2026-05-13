import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import {
  createRestaurantRegistrationOrder,
  getPaymentInfo,
  getRestaurantRegistrationPlan,
  handleRazorpayWebhook,
  renderPhonePeRedirectPage,
  verifyRestaurantRegistrationPayment,
} from "./payment.service";

export const info = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json(getPaymentInfo());
});

export const restaurantRegistrationPlan = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await getRestaurantRegistrationPlan() });
});

export const createRestaurantRegistrationPayment = asyncHandler(async (req: Request, res: Response) => {
  const result = await createRestaurantRegistrationOrder({
    email: String(req.body?.email || ""),
    restaurantName: String(req.body?.restaurantName || ""),
  });
  res.status(201).json({ success: true, data: result });
});

export const verifyRestaurantRegistration = asyncHandler(async (req: Request, res: Response) => {
  const result = await verifyRestaurantRegistrationPayment(req.body);
  res.status(200).json({ success: true, data: result });
});

export const razorpayWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = String(req.headers["x-razorpay-signature"] || "");
  const rawBody = (req as any).rawBody?.toString("utf8") || JSON.stringify(req.body);
  const result = await handleRazorpayWebhook(rawBody, signature, req.body);
  res.status(200).json(result);
});

export const phonePeRedirect = asyncHandler(async (req: Request, res: Response) => {
  const target =
    (typeof req.query.target === "string" && req.query.target) ||
    (typeof req.body?.target === "string" && req.body.target) ||
    undefined;
  const merchantOrderId =
    (typeof req.query.merchantOrderId === "string" && req.query.merchantOrderId) ||
    (typeof req.body?.merchantOrderId === "string" && req.body.merchantOrderId) ||
    undefined;

  res.status(200).type("html").send(renderPhonePeRedirectPage(target, merchantOrderId));
});
