const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const {
  validateCreateCoordinator,
  validateUpdateCoordinator
} = require('../validators/userValidator');

// POST /api/users/coordinator (TPO only)
router.post(
  '/coordinator',
  authenticate,
  requireRole('tpo'),
  validateCreateCoordinator,
  validate,
  userController.createCoordinator
);

// GET /api/users/coordinators (TPO & Coordinator)
router.get(
  '/coordinators',
  authenticate,
  requireRole('tpo', 'coordinator'),
  userController.listCoordinators
);

// PUT /api/users/coordinator/:id or PUT /api/users/:id (TPO only)
router.put(
  '/coordinator/:id',
  authenticate,
  requireRole('tpo'),
  validateUpdateCoordinator,
  validate,
  userController.updateCoordinator
);
router.put(
  '/:id',
  authenticate,
  requireRole('tpo'),
  validateUpdateCoordinator,
  validate,
  userController.updateCoordinator
);

// DELETE /api/users/coordinator/:id or DELETE /api/users/:id (TPO only)
router.delete(
  '/coordinator/:id',
  authenticate,
  requireRole('tpo'),
  userController.deleteCoordinator
);
router.delete(
  '/:id',
  authenticate,
  requireRole('tpo'),
  userController.deleteCoordinator
);

module.exports = router;
