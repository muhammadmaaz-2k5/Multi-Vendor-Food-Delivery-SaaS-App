import { Router } from 'express';
import { createCategory, getCategories, updateCategory, deleteCategory } from './menu.controller.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { createMenuCategorySchema, updateMenuCategorySchema } from './menu.schema.js';

// This router will be mounted at /api/v1/restaurants/:tenantId/categories
const router = Router({ mergeParams: true }); 

router.post('/', requireAuth, validateRequest(createMenuCategorySchema), createCategory);
router.get('/', getCategories);
router.patch('/:categoryId', requireAuth, validateRequest(updateMenuCategorySchema), updateCategory);
router.delete('/:categoryId', requireAuth, deleteCategory);

export default router;
