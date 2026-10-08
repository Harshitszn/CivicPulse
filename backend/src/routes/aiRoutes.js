/**
 * AI Routes
 * Classification requires authentication to prevent abuse of the AI service.
 */
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// AI classification: 60 requests per 15 minutes per authenticated user
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI classification requests. Please slow down.',
  },
});

// POST /api/ai/classify — requires valid session to prevent abuse
router.post('/classify', authenticate, aiLimiter, aiController.classify);

module.exports = router;
