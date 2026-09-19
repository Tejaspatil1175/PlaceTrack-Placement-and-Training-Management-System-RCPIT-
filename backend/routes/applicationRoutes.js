const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Step 60: POST /api/applications/apply/:driveId (Student only)
router.post(
  '/apply/:driveId',
  authenticate,
  requireRole('student'),
  applicationController.applyToDrive
);

module.exports = router;
