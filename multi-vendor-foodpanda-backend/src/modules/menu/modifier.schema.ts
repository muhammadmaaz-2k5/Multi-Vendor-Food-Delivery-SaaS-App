import { z } from 'zod';

export const createModifierGroupSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Group name is required'),
    isRequired: z.boolean().default(false),
    minSelection: z.number().int().min(0).default(0),
    maxSelection: z.number().int().nullable().optional(),
    options: z.array(z.object({
      name: z.string().min(1, 'Option name is required'),
      price: z.number().min(0).default(0),
      isAvailable: z.boolean().default(true),
    })).optional(),
  }),
});
