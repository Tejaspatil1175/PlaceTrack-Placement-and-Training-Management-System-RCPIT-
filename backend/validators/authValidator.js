const { body } = require('express-validator');

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string'),
  body().custom((value, { req }) => {
    const identifier = req.body.identifier || req.body.email || req.body.prn;
    if (!identifier || typeof identifier !== 'string' || identifier.trim() === '') {
      throw new Error('Valid identifier (PRN or Email) is required');
    }
    return true;
  })
];

/**
 * Validation rules for password reset / first login reset
 */
const validatePasswordReset = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required')
    .isString()
    .withMessage('Current password must be a string'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    })
];

module.exports = {
  validateLogin,
  validatePasswordReset
};
