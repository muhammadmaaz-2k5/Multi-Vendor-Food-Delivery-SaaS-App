import { Router } from 'express';
import { getMyProfile, toggleStatus } from './riders.controller.js';

const router = Router();

router.get('/me', getMyProfile);
router.patch('/:id/status', toggleStatus);

export default router;
