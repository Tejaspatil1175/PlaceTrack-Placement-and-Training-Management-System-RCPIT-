const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
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

module.exports = router;
