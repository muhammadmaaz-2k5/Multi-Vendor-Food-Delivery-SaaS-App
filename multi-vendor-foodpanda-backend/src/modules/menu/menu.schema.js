"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { z } = require('zod');
const createMenuCategorySchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Category name is required'),
        description: z.string().optional(),
        sortOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
    }),
});
exports.createMenuCategorySchema = createMenuCategorySchema;
const updateMenuCategorySchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Category name is required').optional(),
        description: z.string().optional(),
        sortOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
    }),
});
exports.updateMenuCategorySchema = updateMenuCategorySchema;
//# sourceMappingURL=menu.schema.js.map