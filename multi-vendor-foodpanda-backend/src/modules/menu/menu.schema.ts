import { z } from 'zod';

export const createMenuCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required'),
    description: z.string().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateMenuCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').optional(),
    description: z.string().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});
