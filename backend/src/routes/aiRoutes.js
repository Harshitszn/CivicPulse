/**
 * AI Routes
 */
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { optionalAuthenticate } = require('../middleware/auth');

// POST /api/ai/classify
router.post('/classify', optionalAuthenticate, aiController.classify);

module.exports = router;
