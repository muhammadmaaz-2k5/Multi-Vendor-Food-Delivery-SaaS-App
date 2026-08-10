const { Router } = require('express');

const { createModifierGroup, deleteModifierGroup } = require('./modifier.controller');

const { validateRequest } = require('../../middlewares/validate.middleware');

const { requireAuth } = require('../../middlewares/auth.middleware');

const { createModifierGroupSchema } = require('./modifier.schema');


const router = Router({ mergeParams: true });

// Mounted at: /api/v1/restaurants/:tenantId/items/:itemId/modifiers
router.post('/', requireAuth, validateRequest(createModifierGroupSchema), createModifierGroup);
router.delete('/:groupId', requireAuth, deleteModifierGroup);

module.exports = router;
