const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const studentProfileController = require('../controllers/studentProfileController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { validateCreateDepartment } = require('../validators/departmentValidator');

// POST /api/departments (TPO only)
router.post(
  '/',
  authenticate,
  requireRole('tpo'),
  validateCreateDepartment,
  validate,
  departmentController.createDepartment
);

// GET /api/departments (TPO & Coordinators)
router.get(
  '/',
  authenticate,
  requireRole('tpo', 'coordinator'),
  departmentController.listDepartments
);

// Step 52: GET /api/departments/:id/students (TPO & Coordinator scoped)
router.get(
  '/:id/students',
  authenticate,
  requireRole('tpo', 'coordinator'),
  studentProfileController.getDepartmentStudents
);

module.exports = router;
