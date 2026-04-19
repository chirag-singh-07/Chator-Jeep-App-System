import { Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import * as service from "./kitchen.service";

// ─── Kitchen Registration (Public) ───────────────────────────────────────────
export const registerKitchen = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await service.registerKitchen(req.body);
    res.status(201).json({
      success: true,
      message: "Kitchen registered successfully. Pending admin verification.",
      data: result,
    });
  }
);

// ─── Kitchen Login (Public) ───────────────────────────────────────────────────
export const loginKitchen = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { email, password } = req.body;
    const result = await service.loginKitchen(email, password);
    res.status(200).json({ success: true, data: result });
  }
);

// ─── Get My Kitchen Status (Kitchen User) ────────────────────────────────────
export const getMyStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await service.getMyKitchenStatus(req.user!.userId);
    res.status(200).json({ success: true, data: result });
  }
);

// ─── Admin: List All Kitchens ─────────────────────────────────────────────────
export const adminListKitchens = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await service.adminListKitchens(
      req.query as Record<string, string>
    );
    res.status(200).json({ success: true, data: result });
  }
);

// ─── Admin: Get Single Kitchen with Full Details ─────────────────────────────
export const adminGetKitchen = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const kitchen = await service.adminGetKitchen(req.params.id);
    res.status(200).json({ success: true, data: kitchen });
  }
);

// ─── Admin: Approve ───────────────────────────────────────────────────────────
export const adminApprove = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const kitchen = await service.adminApproveKitchen(
      req.params.id,
      req.user!.userId
    );
    res.status(200).json({
      success: true,
      message: "Kitchen approved. Notification will be sent.",
      data: { status: kitchen.status, kitchenId: kitchen._id },
    });
  }
);

// ─── Admin: Reject ────────────────────────────────────────────────────────────
export const adminReject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { reason } = req.body;
    const kitchen = await service.adminRejectKitchen(
      req.params.id,
      req.user!.userId,
      reason
    );
    res.status(200).json({
      success: true,
      message: "Kitchen rejected.",
      data: { status: kitchen.status, rejectionReason: kitchen.rejectionReason },
    });
  }
);

// ─── Admin: Mark For Further Review ──────────────────────────────────────────
export const adminMarkReview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { reason } = req.body;
    const kitchen = await service.adminMarkForReview(
      req.params.id,
      req.user!.userId,
      reason ?? ""
    );
    res.status(200).json({
      success: true,
      message: "Kitchen marked for further review.",
      data: { status: kitchen.status },
    });
  }
);

// ─── Existing Handlers (backward compat) ──────────────────────────────────────
import { Request } from "express";
export const createKitchen = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const kitchen = await service.createKitchenProfile(req.user!.userId, req.body);
  res.status(201).json(kitchen);
});

export const updateKitchen = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const kitchen = await service.updateKitchenProfile(req.user!.userId, req.body);
  res.status(200).json(kitchen);
});

export const listKitchens = asyncHandler(async (req: Request, res: Response) => {
  const kitchens = await service.listKitchens(req.query as Record<string, string>);
  res.status(200).json(kitchens);
});

export const listMenu = asyncHandler(async (req: Request, res: Response) => {
  const items = await service.listKitchenMenu(req.params.kitchenId);
  res.status(200).json(items);
});

export const addMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await service.addMenuItem(req.user!.userId, req.body);
  res.status(201).json(item);
});

export const updateMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const item = await service.updateMenuItem(req.user!.userId, req.params.menuItemId as string, req.body);
  res.status(200).json(item);
});
