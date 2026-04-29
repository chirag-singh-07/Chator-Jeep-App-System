import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { getPaymentInfo, renderPhonePeRedirectPage } from "./payment.service";

export const info = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json(getPaymentInfo());
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
