/**
 * JWT authentication middleware.
 * Extracts and verifies the Bearer token from the Authorization header.
 * Attaches decoded user info to req.user.
 *
 * Usage:
 *   router.post('/complaints', authenticate, complaintController.create);
 *   router.post('/admin', authenticate, requireRole('officer', 'admin'), controller.fn);
 */
const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

/**
 * Require a valid JWT access token.
 * Sets req.user = { id, email, role, pincode }.
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authorization header missing or malformed. Expected: Bearer <token>');
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    const decoded = verifyAccessToken(token);

    // Attach decoded claims to request object
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      pincode: decoded.pincode,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional authentication — attaches user if token is present but does NOT
 * fail the request if there is no token. Useful for public+private hybrid routes.
 */
function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      req.user = verifyAccessToken(token);
    }
    next();
  } catch {
    // Token invalid — proceed as unauthenticated
    next();
  }
}

/**
 * Role-based access control middleware factory.
 * Must be used AFTER authenticate.
 *
 * @param {...string} roles  Allowed roles (e.g., 'officer', 'admin')
 * @returns {import('express').RequestHandler}
 *
 * @example
 *   router.patch('/:id/status', authenticate, requireRole('officer', 'admin'), controller.updateStatus);
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
        )
      );
    }
    next();
  };
}

module.exports = { authenticate, optionalAuthenticate, requireRole };
