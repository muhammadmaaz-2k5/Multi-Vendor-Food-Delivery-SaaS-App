import { Router } from 'express';
import { getCustomerOrders } from './orders.controller';

const router = Router();

router.get('/customer/:phone', getCustomerOrders);

export default router;
