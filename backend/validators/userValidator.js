const { body, param } = require('express-validator');

const validateCreateCoordinator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Coordinator name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('departmentId')
    .notEmpty()
    .withMessage('Department ID is required')
    .isInt({ min: 1 })
    .withMessage('Department ID must be a valid positive integer'),
  body('phone')
    .optional({ nullable: true })
    .isString()
    .withMessage('Phone must be a valid string'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long if provided')
];

const validateUpdateCoordinator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a valid integer'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('departmentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Department ID must be a valid positive integer'),
  body('phone')
    .optional({ nullable: true })
    .isString()
    .withMessage('Phone must be a valid string')
];

module.exports = {
  validateCreateCoordinator,
  validateUpdateCoordinator
};
