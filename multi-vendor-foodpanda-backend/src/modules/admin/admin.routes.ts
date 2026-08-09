import { Router } from 'express';
import { getGlobalStats, getAuditLogs } from './admin.controller.js';

const router = Router();

// MVP: Intentionally unprotected so we can access it instantly for testing
router.get('/stats', getGlobalStats);
router.get('/audit-logs', getAuditLogs);

export default router;
