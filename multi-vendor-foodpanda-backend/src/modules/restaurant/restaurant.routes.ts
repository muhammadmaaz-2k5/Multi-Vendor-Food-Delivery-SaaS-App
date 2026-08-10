const { Router } = require('express');

const { registerRestaurant, getMyRestaurants, updateSettings, getWallet, getReviews, getAnalytics } = require('./restaurant.controller');

const { validateRequest } = require('../../middlewares/validate.middleware');

const { requireAuth } = require('../../middlewares/auth.middleware');

const { registerRestaurantSchema } = require('./restaurant.schema');

const menuRoutes = require('../menu/menu.routes');

const menuItemRoutes = require('../menu/menu-item.routes');


const router = Router();

router.post('/register', requireAuth, validateRequest(registerRestaurantSchema), registerRestaurant);
router.get('/me', requireAuth, getMyRestaurants);
router.get('/:tenantId/wallet', requireAuth, getWallet);
router.get('/:tenantId/reviews', getReviews);
router.get('/:tenantId/analytics', requireAuth, getAnalytics);
router.patch('/:id/settings', requireAuth, updateSettings);
router.use('/:tenantId/categories', menuRoutes);
router.use('/:tenantId/categories/:categoryId/items', menuItemRoutes);
router.use('/:tenantId/items', menuItemRoutes);

module.exports = router;
