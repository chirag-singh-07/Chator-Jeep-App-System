import { z } from "zod";

const menuAddOnSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
});

const menuVariantSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
});

const menuTagsSchema = z.object({
  isJain: z.boolean().optional(),
  isSpicy: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
});

export const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    cuisines: z.array(z.string()).optional(),
    location: z.object({
      coordinates: z.tuple([z.number(), z.number()])
    })
  })
});

export const updateRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    cuisines: z.array(z.string()).optional(),
    isOpen: z.boolean().optional(),
    location: z.object({ coordinates: z.tuple([z.number(), z.number()]) }).optional()
  })
});

export const createMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    shortDescription: z.string().optional(),
    price: z.number().nonnegative(),
    discountPrice: z.number().nonnegative().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    isVeg: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    showInMenu: z.boolean().optional(),
    imageUrl: z.string().url().optional(),
    portionSize: z.string().optional(),
    preparationTimeMins: z.number().nonnegative().optional(),
    calories: z.number().nonnegative().optional(),
    ingredients: z.array(z.string()).optional(),
    allergens: z.array(z.string()).optional(),
    availabilitySlots: z.array(z.string()).optional(),
    tags: menuTagsSchema.optional(),
    variants: z.array(menuVariantSchema).optional(),
    addOns: z.array(menuAddOnSchema).optional(),
  })
});

export const updateMenuItemSchema = z.object({
  params: z.object({ menuItemId: z.string().min(12) }),
  body: z.object({
    name: z.string().min(2).optional(),
    shortDescription: z.string().optional(),
    price: z.number().nonnegative().optional(),
    discountPrice: z.number().nonnegative().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    isVeg: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    showInMenu: z.boolean().optional(),
    imageUrl: z.string().url().optional(),
    portionSize: z.string().optional(),
    preparationTimeMins: z.number().nonnegative().optional(),
    calories: z.number().nonnegative().optional(),
    ingredients: z.array(z.string()).optional(),
    allergens: z.array(z.string()).optional(),
    availabilitySlots: z.array(z.string()).optional(),
    tags: menuTagsSchema.optional(),
    variants: z.array(menuVariantSchema).optional(),
    addOns: z.array(menuAddOnSchema).optional(),
  })
});
