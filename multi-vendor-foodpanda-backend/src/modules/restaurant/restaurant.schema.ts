import { z } from 'zod';

export const registerRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Restaurant name is required'),
    description: z.string().optional(),
  }),
});
