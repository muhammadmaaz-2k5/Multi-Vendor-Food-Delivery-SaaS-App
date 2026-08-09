import { Router } from 'express';
import { registerRestaurant, getMyRestaurants } from './restaurant.controller.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { registerRestaurantSchema } from './restaurant.schema.js';
import menuRoutes from '../menu/menu.routes.js';
import menuItemRoutes from '../menu/menu-item.routes.js';

const router = Router();

router.post('/register', requireAuth, validateRequest(registerRestaurantSchema), registerRestaurant);
router.get('/me', requireAuth, getMyRestaurants);
router.use('/:tenantId/categories', menuRoutes);
router.use('/:tenantId/categories/:categoryId/items', menuItemRoutes);
router.use('/:tenantId/items', menuItemRoutes);

export default router;
