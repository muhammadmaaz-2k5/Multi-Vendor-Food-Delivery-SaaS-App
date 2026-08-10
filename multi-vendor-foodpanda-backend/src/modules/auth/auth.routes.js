"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require('express');
const { register, login, getMe } = require('./auth.controller');
const { validateRequest } = require('../../middlewares/validate.middleware');
const { requireAuth } = require('../../middlewares/auth.middleware');
const { registerSchema, loginSchema } = require('./auth.schema');
const router = Router();
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', requireAuth, getMe);
module.exports = router;
//# sourceMappingURL=auth.routes.js.map