/**
 * Dedicated Rate Limiters for Sensitive Endpoints
 * Mitigates brute-force authentication, spamming of complaint creation, and vote stuffing.
 */
const rateLimit = require('express-rate-limit');

/**
 * Authentication rate limiter: 15 attempts per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Complaint creation rate limiter: 20 complaints per hour
 */
const complaintCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Complaint creation limit reached for this hour. Please try again later.',
  },
});

/**
 * Voting rate limiter: 60 vote operations per 15 minutes
 */
const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many voting requests. Please try again later.',
  },
});

/**
 * Resolution verification rate limiter: 30 verifications per 15 minutes
 */
const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts. Please wait before submitting more verifications.',
  },
});

/**
 * Comment posting rate limiter: 30 comments per 15 minutes
 */
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many comments posted. Please wait before posting more.',
  },
});

module.exports = {
  authLimiter,
  complaintCreateLimiter,
  voteLimiter,
  verificationLimiter,
  commentLimiter,
};
