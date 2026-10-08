/**
 * Global error-handling middleware.
 * Must be registered LAST in app.js (after all routes).
 * Catches ApiError instances and unexpected errors uniformly.
 */
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { config } = require('../config/env');

/**
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // ── Known operational error ─────────────────────────────────────────────
  if (err instanceof ApiError) {
    logger.warn(`[${err.statusCode}] ${req.method} ${req.originalUrl} — ${err.message}`, {
      details: err.details,
      userId: req.user?.id,
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // ── Knex / PostgreSQL constraint errors ─────────────────────────────────
  if (err.code === '23505') {
    // unique_violation
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
      ...(config.isDev && { detail: err.detail }),
    });
  }

  if (err.code === '23503') {
    // foreign_key_violation
    return res.status(400).json({
      success: false,
      message: 'Referenced resource does not exist.',
      ...(config.isDev && { detail: err.detail }),
    });
  }

  if (err.code === '23502') {
    // not_null_violation
    return res.status(400).json({
      success: false,
      message: 'A required field is missing.',
      ...(config.isDev && { detail: err.detail }),
    });
  }

  // ── Multer upload errors ──────────────────────────────────────────────
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File is too large. Maximum allowed size is 5MB.' });
    }
    return res.status(400).json({ success: false, message: err.message || 'File upload error.' });
  }

  // ── JWT errors (caught before reaching here via middleware, but safety net) ──
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  // ── Unexpected / programmer error ────────────────────────────────────────
  logger.error(`[500] Unhandled error on ${req.method} ${req.originalUrl}`, {
    error: err.message,
    stack: err.stack,
    userId: req.user?.id,
  });

  return res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred.',
    ...(config.isDev && { stack: err.stack }),
  });
}

module.exports = errorHandler;
