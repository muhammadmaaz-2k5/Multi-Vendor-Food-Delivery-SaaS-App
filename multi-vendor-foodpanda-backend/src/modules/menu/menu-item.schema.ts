const { z } = require('zod');


const createMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Item name is required'),
    description: z.string().optional(),
    price: z.preprocess((val: any) => Number(val), z.number().positive()),
    isActive: z.preprocess((val: any) => val === 'true' || val === true, z.boolean()).optional(),
    isAvailable: z.preprocess((val: any) => val === 'true' || val === true, z.boolean()).optional(),
  }),
});
exports.createMenuItemSchema = createMenuItemSchema;


const updateMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Item name is required').optional(),
    description: z.string().optional(),
    price: z.preprocess((val: any) => val !== undefined ? Number(val) : undefined, z.number().positive().optional()),
    isActive: z.preprocess((val: any) => val !== undefined ? (val === 'true' || val === true) : undefined, z.boolean().optional()),
    isAvailable: z.preprocess((val: any) => val !== undefined ? (val === 'true' || val === true) : undefined, z.boolean().optional()),
  }),
});
exports.updateMenuItemSchema = updateMenuItemSchema;

