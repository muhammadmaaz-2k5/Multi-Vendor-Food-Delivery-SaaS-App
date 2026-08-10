const { Router } = require('express');

const { getMyProfile, toggleStatus } = require('./riders.controller');


const router = Router();

router.get('/me', getMyProfile);
router.patch('/:id/status', toggleStatus);

module.exports = router;
