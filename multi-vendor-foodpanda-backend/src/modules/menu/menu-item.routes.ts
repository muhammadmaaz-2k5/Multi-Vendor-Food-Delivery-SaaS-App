import { Router } from 'express';
import { createMenuItem, getMenuItems, updateMenuItem, deleteMenuItem } from './menu-item.controller.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { createMenuItemSchema, updateMenuItemSchema } from './menu-item.schema.js';
import { upload } from '../../middlewares/upload.middleware.js';
import modifierRoutes from './modifier.routes.js';

const router = Router({ mergeParams: true });

router.post('/', requireAuth, upload.single('image'), validateRequest(createMenuItemSchema), createMenuItem);
router.get('/', getMenuItems);

// For PATCH and DELETE on items directly (without needing categoryId in path)
router.patch('/:itemId', requireAuth, upload.single('image'), validateRequest(updateMenuItemSchema), updateMenuItem);
router.delete('/:itemId', requireAuth, deleteMenuItem);

// Nested Modifiers
router.use('/:itemId/modifiers', modifierRoutes);

export default router;
