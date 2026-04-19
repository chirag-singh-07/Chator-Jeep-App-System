import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/async-handler";
import * as service from "./category.service";

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await service.createCategory(req.body);
  res.status(201).json({ success: true, data: category });
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await service.listCategories(req.query.active === "true");
  res.status(200).json({ success: true, data: categories });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await service.getCategory(req.params.id);
  res.status(200).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await service.updateCategory(req.params.id, req.body);
  res.status(200).json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await service.removeCategory(req.params.id);
  res.status(200).json({ success: true, message: "Category deleted successfully" });
});
