const { Router } = require('express');

const { createMenuItem, getMenuItems, updateMenuItem, deleteMenuItem } = require('./menu-item.controller');

const { validateRequest } = require('../../middlewares/validate.middleware');

const { requireAuth } = require('../../middlewares/auth.middleware');

const { createMenuItemSchema, updateMenuItemSchema } = require('./menu-item.schema');

const { upload } = require('../../middlewares/upload.middleware');

const modifierRoutes = require('./modifier.routes');


const router = Router({ mergeParams: true });

router.post('/', requireAuth, upload.single('image'), validateRequest(createMenuItemSchema), createMenuItem);
router.get('/', getMenuItems);

// For PATCH and DELETE on items directly (without needing categoryId in path)
router.patch('/:itemId', requireAuth, upload.single('image'), validateRequest(updateMenuItemSchema), updateMenuItem);
router.delete('/:itemId', requireAuth, deleteMenuItem);

// Nested Modifiers
router.use('/:itemId/modifiers', modifierRoutes);

module.exports = router;
