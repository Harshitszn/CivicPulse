/**
 * JWT utility — sign and verify tokens.
 * Reads secrets from the centralised config (never from process.env directly).
 */
const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const ApiError = require('./ApiError');

/**
 * Sign an access token.
 * @param {Object} payload  Data to encode (e.g., { userId, role })
 * @returns {string}        Signed JWT string
 */
function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: 'civicpulse-api',
  });
}

/**
 * Sign a refresh token.
 * @param {Object} payload
 * @returns {string}
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'civicpulse-api',
  });
}

/**
 * Verify an access token.
 * @param {string} token
 * @returns {Object} Decoded payload
 * @throws {ApiError} 401 if invalid or expired
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'civicpulse-api',
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token has expired. Please refresh.');
    }
    throw ApiError.unauthorized('Invalid access token.');
  }
}

/**
 * Verify a refresh token.
 * @param {string} token
 * @returns {Object} Decoded payload
 * @throws {ApiError} 401 if invalid or expired
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'civicpulse-api',
    });
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token.');
  }
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
