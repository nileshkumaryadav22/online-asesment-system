const express = require('express');
const { startAttempt, submitAttempt, getAttemptResult } = require('../controllers/attemptController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/start', protect, startAttempt);
router.post('/:id/submit', protect, submitAttempt);
router.get('/:id/result', protect, getAttemptResult);

module.exports = router;
