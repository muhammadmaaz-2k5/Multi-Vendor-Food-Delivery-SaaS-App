import { Router } from 'express';
import { createModifierGroup, deleteModifierGroup } from './modifier.controller.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { createModifierGroupSchema } from './modifier.schema.js';

const router = Router({ mergeParams: true });

// Mounted at: /api/v1/restaurants/:tenantId/items/:itemId/modifiers
router.post('/', requireAuth, validateRequest(createModifierGroupSchema), createModifierGroup);
router.delete('/:groupId', requireAuth, deleteModifierGroup);

export default router;
