"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require('express');
const { getGlobalStats, getAuditLogs } = require('./admin.controller');
const router = Router();
// MVP: Intentionally unprotected so we can access it instantly for testing
router.get('/stats', getGlobalStats);
router.get('/audit-logs', getAuditLogs);
module.exports = router;
//# sourceMappingURL=admin.routes.js.map