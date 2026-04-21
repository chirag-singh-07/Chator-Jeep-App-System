import { Response, Request } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import { AuthenticatedRequest } from "../../common/middleware/auth.middleware";
import * as service from "./restaurant.service";

// ─── Registration & Auth ─────────────────────────────────────────────────────
export const registerRestaurant = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await service.registerRestaurant(req.body);
    res.status(201).json({
      success: true,
      message:
        "Restaurant registered successfully. Pending admin verification.",
      data: result,
    });
  },
);

export const loginRestaurant = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await service.loginRestaurant(email, password);
    res.status(200).json({ success: true, data: result });
  },
);

export const getMyStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await service.getMyRestaurantStatus(req.user!.userId);
    res.status(200).json({ success: true, data: result });
  },
);

// ─── Admin Handlers ──────────────────────────────────────────────────────────
export const adminListRestaurants = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await service.adminListRestaurants(
      req.query as Record<string, string>,
    );
    res.status(200).json({ success: true, ...result });
  },
);

export const adminGetRestaurant = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const restaurant = await service.adminGetRestaurant(
      req.params.id as string,
    );
    res.status(200).json({ success: true, data: restaurant });
  },
);

export const adminApprove = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const restaurant = await service.adminApproveRestaurant(
      req.params.id as string,
      req.user!.userId as string,
    );
    res.status(200).json({
      success: true,
      message: "Restaurant approved. Notification will be sent.",
      data: { status: restaurant.status, restaurantId: restaurant._id },
    });
  },
);

export const adminReject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { reason } = req.body;
    const restaurant = await service.adminRejectRestaurant(
      req.params.id as string,
      req.user!.userId as string,
      reason as string,
    );
    res.status(200).json({
      success: true,
      message: "Restaurant rejected.",
      data: {
        status: restaurant.status,
        rejectionReason: restaurant.rejectionReason,
      },
    });
  },
);

export const adminFlag = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { reason } = req.body;
    const restaurant = await service.adminFlagRestaurant(
      req.params.id as string,
      req.user!.userId as string,
      reason as string,
    );
    res.status(200).json({
      success: true,
      message: "Restaurant flagged.",
      data: { status: restaurant.status },
    });
  },
);

// ─── Menu Handlers ────────────────────────────────────────────────────────────
export const addMenuItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const item = await service.addMenuItem(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: item });
  },
);

export const listRestaurantMenu = asyncHandler(
  async (req: Request, res: Response) => {
    const items = await service.listRestaurantMenu(
      req.params.restaurantId as string,
    );
    res.status(200).json({ success: true, data: items });
  },
);

export const updateMyBranding = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await service.updateRestaurantBranding(
      req.user!.userId,
      req.body,
    );
    res.status(200).json({ success: true, data: result });
  },
);

export const updateMyOpenStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { isOpen } = req.body;
    const result = await service.updateRestaurantOpenStatus(
      req.user!.userId,
      !!isOpen,
    );
    res.status(200).json({ success: true, data: { isOpen: result?.isOpen } });
  },
);

export const updateMenuItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const item = await service.updateMenuItem(
      req.user!.userId,
      req.params.id as string,
      req.body,
    );
    res.status(200).json({ success: true, data: item });
  },
);

export const deleteMenuItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    await service.deleteMenuItem(req.user!.userId, req.params.id as string);
    res.status(200).json({ success: true, message: "Menu item deleted." });
  },
);

export const updateMenuItemStock = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { isAvailable } = req.body;
    const item = await service.updateMenuItemStock(
      req.user!.userId,
      req.params.id as string,
      !!isAvailable,
    );
    res.status(200).json({ success: true, data: item });
  },
);
