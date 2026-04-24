import * as repo from "./category.repository";
import { AppError } from "../../common/errors/app-error";

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const normalizeSubcategories = (subcategories: unknown): string[] => {
  if (!Array.isArray(subcategories)) {
    return [];
  }

  const seen = new Set<string>();

  return subcategories
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
};

export const createCategory = async (data: any) => {
  const slug = slugify(data.name);
  const existing = await repo.findCategoryBySlug(slug);
  if (existing) throw new AppError("A category with this name already exists", 400);

  return repo.createCategory({
    ...data,
    slug,
    subcategories: normalizeSubcategories(data.subcategories),
  });
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
    data.slug = slugify(data.name);
    const existing = await repo.findCategoryBySlugExcludingId(data.slug, id);
    if (existing) throw new AppError("A category with this name already exists", 400);
  }

  if (data.subcategories) {
    data.subcategories = normalizeSubcategories(data.subcategories);
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
