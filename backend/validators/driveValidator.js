const { body } = require('express-validator');

const validateCreateDrive = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),

  body('role')
    .trim()
    .notEmpty()
    .withMessage('Job role is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Role must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim(),

  body('ctc')
    .notEmpty()
    .withMessage('CTC is required')
    .isFloat({ min: 0.1 })
    .withMessage('CTC must be a positive number in LPA'),

  body('minCgpa')
    .optional()
    .isFloat({ min: 0.0, max: 10.0 })
    .withMessage('Minimum CGPA must be between 0.0 and 10.0'),

  body('maxActiveBacklogs')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum active backlogs must be an integer >= 0'),

  body('allowedBranches')
    .isArray({ min: 1 })
    .withMessage('allowedBranches must be a non-empty array of branch names'),

  body('minSemester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Minimum semester must be between 1 and 8'),

  body('deadline')
    .notEmpty()
    .withMessage('Application deadline is required')
    .isISO8601()
    .withMessage('Deadline must be a valid ISO 8601 date string'),

  body('status')
    .optional()
    .isIn(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'])
    .withMessage('Status must be UPCOMING, ONGOING, COMPLETED, or CANCELLED')
];

module.exports = {
  validateCreateDrive
};
