const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { validateUpdateStatus, validateBulkUpdateStatus } = require('../validators/applicationValidator');

// Step 60: POST /api/applications/apply/:driveId (Student only)
router.post(
  '/apply/:driveId',
  authenticate,
  requireRole('student'),
  applicationController.applyToDrive
);

// Step 61: GET /api/applications/me (Student only)
router.get(
  '/me',
  authenticate,
  requireRole('student'),
  applicationController.getMyApplications
);

// Step 62: PUT /api/applications/:id/status (TPO & Coordinator)
router.put(
  '/:id/status',
  authenticate,
  requireRole('tpo', 'coordinator'),
  validateUpdateStatus,
  validate,
  applicationController.updateApplicationStatus
);

// Step 63: POST /api/applications/bulk-status (TPO & Coordinator)
router.post(
  '/bulk-status',
  authenticate,
  requireRole('tpo', 'coordinator'),
  validateBulkUpdateStatus,
  validate,
  applicationController.bulkUpdateApplicationStatus
);

// GET /api/applications/drive/:driveId (TPO & Coordinator)
router.get(
  '/drive/:driveId',
  authenticate,
  requireRole('tpo', 'coordinator'),
  applicationController.getDriveApplications
);

module.exports = router;
