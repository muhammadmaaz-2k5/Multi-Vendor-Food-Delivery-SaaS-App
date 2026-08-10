const { Router } = require('express');

const { createCategory, getCategories, updateCategory, deleteCategory } = require('./menu.controller');

const { validateRequest } = require('../../middlewares/validate.middleware');

const { requireAuth } = require('../../middlewares/auth.middleware');

const { createMenuCategorySchema, updateMenuCategorySchema } = require('./menu.schema');


// This router will be mounted at /api/v1/restaurants/:tenantId/categories
const router = Router({ mergeParams: true }); 

router.post('/', requireAuth, validateRequest(createMenuCategorySchema), createCategory);
router.get('/', getCategories);
router.patch('/:categoryId', requireAuth, validateRequest(updateMenuCategorySchema), updateCategory);
router.delete('/:categoryId', requireAuth, deleteCategory);

module.exports = router;
