const { Router } = require('express');

const { getCustomerOrders, getTenantOrders, updateOrderStatus, validateCoupon, createReview } = require('./orders.controller');


const router = Router();

router.get('/customer/:phone', getCustomerOrders);
router.get('/tenant/:tenantId', getTenantOrders);
router.patch('/:id/status', updateOrderStatus);
router.post('/validate-coupon', validateCoupon);
router.post('/:id/reviews', createReview);

module.exports = router;
