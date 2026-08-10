const { Router } = require('express');

const { getRestaurants, getRestaurantById, getRecommendations } = require('./discovery.controller');


const router = Router();

router.get('/restaurants', getRestaurants);
router.get('/recommendations', getRecommendations);
router.get('/restaurants/:id', getRestaurantById);

module.exports = router;
