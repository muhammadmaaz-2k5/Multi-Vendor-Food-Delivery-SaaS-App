import { Router } from 'express';
import { getCustomerOrders, getTenantOrders, updateOrderStatus, validateCoupon, createReview } from './orders.controller.js';

const router = Router();

router.get('/customer/:phone', getCustomerOrders);
router.get('/tenant/:tenantId', getTenantOrders);
router.patch('/:id/status', updateOrderStatus);
router.post('/validate-coupon', validateCoupon);
router.post('/:id/reviews', createReview);

export default router;
