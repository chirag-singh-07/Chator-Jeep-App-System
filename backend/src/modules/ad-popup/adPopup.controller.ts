import { Request, Response } from 'express';
import * as service from './adPopup.service';
import { Order } from '../order/order.model';

export const getActivePopup = async (req: Request, res: Response) => {
  try {
    let isNewUser = false;
    
    // Check if user is logged in
    const userId = (req as any).user?.userId;
    if (userId) {
      const pastOrders = await Order.countDocuments({
        userId,
        status: { $ne: 'CANCELLED' }
      });
      isNewUser = pastOrders === 0;
    } else {
      // For anonymous users, we might consider them new users
      isNewUser = true;
    }

    const popup = await service.getActiveAdPopup(isNewUser);
    res.json({ success: true, data: popup });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPopups = async (req: Request, res: Response) => {
  try {
    const popups = await service.getAllAdPopups();
    res.json({ success: true, data: popups });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPopup = async (req: Request, res: Response) => {
  try {
    const popup = await service.createAdPopup(req.body);
    res.status(201).json({ success: true, data: popup });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePopup = async (req: Request, res: Response) => {
  try {
    const popup = await service.updateAdPopup(req.params.id as string, req.body);
    res.json({ success: true, data: popup });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePopup = async (req: Request, res: Response) => {
  try {
    await service.deleteAdPopup(req.params.id as string);
    res.json({ success: true, message: 'AdPopup deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
