"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require('express');
const express = require('express');
const { onboardTenant, createProduct, createCheckoutSession, webhookHandler, generateDashboardLink } = require('./payments.controller');
const router = Router();
router.post('/onboard', onboardTenant);
router.post('/products', createProduct);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/stripe/dashboard-link', generateDashboardLink);
// Webhook requires raw body parsing, but typically we handle that in app.ts before standard JSON parsing.
// For simplicity in this demo, assuming app.ts handles raw body or we use a custom parser if needed.
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);
module.exports = router;
//# sourceMappingURL=payments.routes.js.map