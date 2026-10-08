/**
 * Verification Routes
 * Mounted under /api/complaints/:id/verification
 * (registered via complaintRoutes to keep :id in scope)
 */
const express = require('express');
const router = express.Router({ mergeParams: true });
const verificationController = require('../controllers/verificationController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { verificationLimiter } = require('../middleware/rateLimiters');

// GET  /api/complaints/:id/verification  – public aggregate + optional user state
router.get('/', optionalAuthenticate, verificationController.getVerificationStatus);

// POST /api/complaints/:id/verification  – submit / update verification (authenticated)
router.post('/', authenticate, verificationLimiter, verificationController.submitVerification);

// DELETE /api/complaints/:id/verification  – withdraw verification (authenticated)
router.delete('/', authenticate, verificationLimiter, verificationController.withdrawVerification);

module.exports = router;
