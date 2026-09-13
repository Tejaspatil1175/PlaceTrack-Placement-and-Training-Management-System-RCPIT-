const express = require('express');
const router = express.Router();
const studentUploadController = require('../controllers/studentUploadController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { uploadExcel } = require('../middleware/upload');

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

module.exports = router;
