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

const validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('prn')
    .optional()
    .isString()
    .trim(),
  body('phone')
    .optional()
    .isString()
    .trim(),
  body('departmentId')
    .optional()
    .isInt()
    .withMessage('Department ID must be an integer'),
  body('branch')
    .optional()
    .isString()
    .trim(),
  body('division')
    .optional()
    .isString()
    .trim(),
  body('admissionYear')
    .optional()
    .isInt(),
  body('currentSemester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Current semester must be between 1 and 8')
];

module.exports = {
  validateLogin,
  validatePasswordReset,
  validateRegister
};
