import * as repo from "./category.repository";
import { AppError } from "../../common/errors/app-error";

export const createCategory = async (data: any) => {
  const slug = data.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
  const existing = await repo.findCategoryBySlug(slug);
  if (existing) throw new AppError("A category with this name already exists", 400);

  return repo.createCategory({ ...data, slug });
};

export const listCategories = (onlyActive = false) => {
  const query = onlyActive ? { isActive: true } : {};
  return repo.listCategories(query);
};

export const getCategory = async (id: string) => {
  const category = await repo.findCategoryById(id);
  if (!category) throw new AppError("Category not found", 404);
  return category;
};

export const updateCategory = async (id: string, data: any) => {
  if (data.name) {
    data.slug = data.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
  }
  const updated = await repo.updateCategory(id, data);
  if (!updated) throw new AppError("Category not found", 404);
  return updated;
};

export const removeCategory = async (id: string) => {
  const deleted = await repo.deleteCategory(id);
  if (!deleted) throw new AppError("Category not found", 404);
  return deleted;
};
