const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { createNotificationValidator } = require('../validators/notificationValidator');


/**
 * Step 68: Create/send notification (TPO & Coordinator only)
 * POST /api/notifications
 */
router.post(
  '/',
  authenticate,
  requireRole('tpo', 'coordinator'),
  createNotificationValidator,
  validate,
  notificationController.createNotification
);

/**
 * Step 69: List notifications for the authenticated user/student
 * GET /api/notifications/me
 */
router.get(
  '/me',
  authenticate,
  notificationController.getMyNotifications
);

/**
 * List all notifications (TPO & Coordinator only)
 * GET /api/notifications
 */
router.get(
  '/',
  authenticate,
  requireRole('tpo', 'coordinator'),
  notificationController.listNotifications
);

module.exports = router;


