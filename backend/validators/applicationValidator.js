const { body } = require('express-validator');

const validStatuses = ['APPLIED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'];

const validateUpdateStatus = [
  body('status')
    .notEmpty()
    .withMessage('Application status is required')
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
  body('notes')
    .optional()
    .trim()
];

const validateBulkUpdateStatus = [
  body('applicationIds')
    .isArray({ min: 1 })
    .withMessage('applicationIds must be a non-empty array of application IDs'),
  body('status')
    .notEmpty()
    .withMessage('Application status is required')
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
  body('notes')
    .optional()
    .trim()
];

module.exports = {
  validateUpdateStatus,
  validateBulkUpdateStatus
};
