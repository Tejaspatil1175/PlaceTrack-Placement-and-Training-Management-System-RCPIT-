const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { validateUpdateStatus } = require('../validators/applicationValidator');

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

module.exports = router;
