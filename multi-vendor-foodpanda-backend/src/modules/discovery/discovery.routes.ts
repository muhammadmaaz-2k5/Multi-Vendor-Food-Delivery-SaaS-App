import { Router } from 'express';
import { getRestaurants, getRestaurantById, getRecommendations } from './discovery.controller.js';

const router = Router();

router.get('/restaurants', getRestaurants);
router.get('/recommendations', getRecommendations);
router.get('/restaurants/:id', getRestaurantById);

export default router;
