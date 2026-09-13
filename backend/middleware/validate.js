const { validationResult } = require('express-validator');

/**
 * Middleware that checks validation results from express-validator chains.
 * If validation errors exist, responds with 400 and structured error details.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  return next();
};

module.exports = validate;
