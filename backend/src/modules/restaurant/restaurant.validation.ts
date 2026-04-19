import { z } from "zod";

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
    price: z.number().nonnegative(),
    description: z.string().optional(),
    category: z.string().optional(),
    isVeg: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    imageUrl: z.string().url().optional()
  })
});

export const updateMenuItemSchema = z.object({
  params: z.object({ menuItemId: z.string().min(12) }),
  body: z.object({
    name: z.string().min(2).optional(),
    price: z.number().nonnegative().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    isVeg: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    imageUrl: z.string().url().optional()
  })
});
