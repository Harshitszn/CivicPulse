/**
 * Express-validator middleware runner.
 * Evaluates validation rules and passes formatted errors to next() or ApiError.
 */
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return next(ApiError.badRequest('Validation failed', extractedErrors));
  };
};

module.exports = validate;
