import { Category, ICategory } from "./category.model";

export const createCategory = (payload: Partial<ICategory>) => Category.create(payload);

export const findCategoryById = (id: string) => Category.findById(id).exec();

export const findCategoryBySlug = (slug: string) => Category.findOne({ slug }).exec();

export const listCategories = (query: any = {}) => Category.find(query).sort({ order: 1, name: 1 }).exec();

export const updateCategory = (id: string, payload: Partial<ICategory>) =>
  Category.findByIdAndUpdate(id, payload, { new: true }).exec();

export const deleteCategory = (id: string) => Category.findByIdAndDelete(id).exec();
