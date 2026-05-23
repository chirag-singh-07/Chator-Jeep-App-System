import { Request, Response } from "express";
import deletionService from "./deletion.service";
import { AppError } from "../../common/errors/app-error";
import { StatusCode } from "../../common/constants/status-code";

export const requestDeletion = async (req: Request, res: Response) => {
  const { email, reason } = req.body;

  if (!email || !reason) {
    throw new AppError("Email and reason are required", StatusCode.BAD_REQUEST);
  }

  const request = await deletionService.requestDeletion(
    email,
    reason,
    req.ip,
    req.get("user-agent"),
  );
  res.status(201).json({ success: true, data: request });
};

export const confirmDeletion = async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const request = await deletionService.confirmDeletion(requestId as string);
  res.status(200).json({ success: true, data: request });
};

export const cancelDeletion = async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const { reason } = req.body;
  const request = await deletionService.cancelDeletion(
    requestId as string,
    reason,
  );
  res.status(200).json({ success: true, data: request });
};

export const processExpiredDeletions = async (req: Request, res: Response) => {
  const request = await deletionService.processExpiredDeletions();
  res.status(200).json({ success: true, data: request });
};

export const getDeletionStats = async (req: Request, res: Response) => {
  const stats = await deletionService.getStatistics();
  res.status(200).json({ success: true, data: stats });
};

export const searchDeletions = async (req: Request, res: Response) => {
  const { query } = req.query;
  const requests = await deletionService.searchRequests(query as string);
  res.status(200).json({ success: true, data: requests });
};

export const getAllDeletions = async (req: Request, res: Response) => {
  const requests = await deletionService.getAllRequests();
  res.status(200).json({ success: true, data: requests });
};

export const getDeletionDetails = async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const request = await deletionService.getRequest(requestId as string);
  res.status(200).json({ success: true, data: request });
};

export const adminCancelDeletion = async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const { reason } = req.body;
  const request = await deletionService.cancelDeletion(
    requestId as string,
    reason,
  );
  res.status(200).json({ success: true, data: request });
};
