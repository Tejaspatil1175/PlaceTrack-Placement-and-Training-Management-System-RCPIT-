const { body } = require('express-validator');

const createNotificationValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Notification title is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Notification message is required')
    .isLength({ min: 5 })
    .withMessage('Message must be at least 5 characters long'),

  body('targetType')
    .optional()
    .isIn(['ALL', 'DEPARTMENT', 'STUDENTS', 'COORDINATORS'])
    .withMessage('Invalid targetType. Allowed: ALL, DEPARTMENT, STUDENTS, COORDINATORS'),

  body('targetDepartmentId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('targetDepartmentId must be a positive integer'),

  body('type')
    .optional()
    .isIn(['INFO', 'DRIVE', 'SELECTION', 'GENERAL'])
    .withMessage('Invalid notification type. Allowed: INFO, DRIVE, SELECTION, GENERAL'),

  body('sendEmailBroadcast')
    .optional()
    .isBoolean()
    .withMessage('sendEmailBroadcast must be a boolean value')
];

module.exports = {
  createNotificationValidator
};
