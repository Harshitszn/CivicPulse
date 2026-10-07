/**
 * Standardised API response helpers.
 * All routes should use these to ensure a consistent response envelope.
 *
 * Envelope shape:
 *   { success: true,  data: ..., message: ..., pagination: ... }
 *   { success: false, message: ..., details: ... }
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {*}      data        Payload to send
 * @param {string} [message]   Optional human-readable message
 * @param {number} [statusCode=200]
 * @param {Object} [pagination] Optional pagination metadata
 */
function sendSuccess(res, data, message = 'Success', statusCode = 200, pagination = null) {
  const body = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  return res.status(statusCode).json(body);
}

/**
 * Send a created (201) response.
 * @param {import('express').Response} res
 * @param {*}      data
 * @param {string} [message]
 */
function sendCreated(res, data, message = 'Resource created') {
  return sendSuccess(res, data, message, 201);
}

/**
 * Send a no-content (204) response.
 * @param {import('express').Response} res
 */
function sendNoContent(res) {
  return res.status(204).end();
}

/**
 * Build a pagination metadata object.
 * @param {number} page
 * @param {number} limit
 * @param {number} total
 */
function buildPagination(page, limit, total) {
  return {
    page: Number(page),
    limit: Number(limit),
    total: Number(total),
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

module.exports = { sendSuccess, sendCreated, sendNoContent, buildPagination };
