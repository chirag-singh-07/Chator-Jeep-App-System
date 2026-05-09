import { Request, Response } from 'express';
import { BannerService } from './banner.service';

const service = new BannerService();

export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await service.getActiveBanners();
    res.json({ success: true, data: banners });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBannersAdmin = async (req: Request, res: Response) => {
  try {
    const banners = await service.getAllBanners();
    res.json({ success: true, data: banners });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const banner = await service.createBanner(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const banner = await service.updateBanner(req.params.id as string, req.body);
    res.json({ success: true, data: banner });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    await service.deleteBanner(req.params.id as string);
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
