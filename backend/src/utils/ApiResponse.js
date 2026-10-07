/**
 * Standardised API response helpers.
 * All routes use these to ensure a consistent response envelope:
 *   { success: true,  data: ..., message: ..., pagination: ... }
 *   { success: false, message: ..., details: ... }
 */

function sendSuccess(res, data, message = 'Success', statusCode = 200, pagination = null) {
  const body = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  return res.status(statusCode).json(body);
}

function sendCreated(res, data, message = 'Resource created') {
  return sendSuccess(res, data, message, 201);
}

function sendNoContent(res) {
  return res.status(204).end();
}

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

const ApiResponse = {
  ok: (res, data, message) => sendSuccess(res, data, message, 200),
  created: (res, data, message) => sendCreated(res, data, message),
  noContent: (res) => sendNoContent(res),
  paginated: (res, data, pagination, message) => sendSuccess(res, data, message, 200, pagination),
};

module.exports = {
  ApiResponse,
  sendSuccess,
  sendCreated,
  sendNoContent,
  buildPagination,
};
