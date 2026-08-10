"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { z } = require('zod');
const registerRestaurantSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Restaurant name is required'),
        description: z.string().optional(),
    }),
});
exports.registerRestaurantSchema = registerRestaurantSchema;
//# sourceMappingURL=restaurant.schema.js.map