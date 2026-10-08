/**
 * Vote routes
 */
const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { authenticate } = require('../middleware/auth');
const { voteLimiter } = require('../middleware/rateLimiters');

router.post('/:complaintId', authenticate, voteLimiter, voteController.castVote);
router.get('/:complaintId/me', authenticate, voteController.getUserVote);

module.exports = router;
