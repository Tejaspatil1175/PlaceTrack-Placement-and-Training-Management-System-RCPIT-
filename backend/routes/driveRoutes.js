const express = require('express');
const router = express.Router();
const driveController = require('../controllers/driveController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { validateCreateDrive } = require('../validators/driveValidator');

// Step 55: POST /api/drives (TPO only)
router.post(
  '/',
  authenticate,
  requireRole('tpo'),
  validateCreateDrive,
  validate,
  driveController.createDrive
);

// Step 56: GET /api/drives (Authenticated: TPO, Coordinator, Student)
router.get(
  '/',
  authenticate,
  driveController.listDrives
);

// GET /api/drives/:id (Authenticated: TPO, Coordinator, Student)
router.get(
  '/:id',
  authenticate,
  driveController.getDriveById
);

// Step 58: GET /api/drives/:id/eligible-students (TPO & Coordinator only)
router.get(
  '/:id/eligible-students',
  authenticate,
  requireRole('tpo', 'coordinator'),
  driveController.getEligibleStudents
);

// Step 60: POST /api/drives/:id/apply (Student only)
const applicationController = require('../controllers/applicationController');
router.post(
  '/:id/apply',
  authenticate,
  requireRole('student'),
  applicationController.applyToDrive
);

module.exports = router;
