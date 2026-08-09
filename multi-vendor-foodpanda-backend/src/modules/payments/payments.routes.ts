import { Router } from 'express';
import express from 'express';
import { onboardTenant, createProduct, createCheckoutSession, webhookHandler } from './payments.controller';

const router = Router();

router.post('/onboard', onboardTenant);
router.post('/products', createProduct);
router.post('/create-checkout-session', createCheckoutSession);

// Webhook requires raw body parsing, but typically we handle that in app.ts before standard JSON parsing.
// For simplicity in this demo, assuming app.ts handles raw body or we use a custom parser if needed.
router.post('/webhook', express.raw({type: 'application/json'}), webhookHandler);

export default router;
