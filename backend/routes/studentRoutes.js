const express = require('express');
const router = express.Router();
const studentUploadController = require('../controllers/studentUploadController');
const studentProfileController = require('../controllers/studentProfileController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { uploadExcel, uploadResume } = require('../middleware/upload');

// GET /api/students/template (Download official Excel ingestion template)
router.get('/template', studentUploadController.downloadTemplate);

// POST /api/students/bulk-upload (TPO & Coordinator)
router.post(
  '/bulk-upload',
  authenticate,
  requireRole('tpo', 'coordinator'),
  uploadExcel('file'),
  studentUploadController.bulkUploadStudents
);

// GET /api/students/upload-logs (TPO & Coordinator)
router.get(
  '/upload-logs',
  authenticate,
  requireRole('tpo', 'coordinator'),
  studentUploadController.getUploadLogs
);

// Step 47: GET /api/students/me (Self profile view with cached CGPA/backlogs)
router.get(
  '/me',
  authenticate,
  requireRole('student'),
  studentProfileController.getMyProfile
);

// Step 48: GET /api/students/me/academics (Transcript view)
router.get(
  '/me/academics',
  authenticate,
  requireRole('student'),
  studentProfileController.getMyAcademics
);

// Step 49: PUT /api/students/me (Self profile update)
router.put(
  '/me',
  authenticate,
  requireRole('student'),
  studentProfileController.updateMyProfile
);

// Step 51: POST /api/students/me/resume (Cloudinary resume upload)
router.post(
  '/me/resume',
  authenticate,
  requireRole('student'),
  uploadResume('resume'),
  studentProfileController.uploadResume
);

// Step 53: PUT /api/students/:id/semester/:num (Manual academic correction by TPO/Coordinator)
router.put(
  '/:id/semester/:num',
  authenticate,
  requireRole('tpo', 'coordinator'),
  studentProfileController.updateSemesterRecord
);

module.exports = router;
