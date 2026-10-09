const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const {
  validateLogin,
  validatePasswordReset,
  validateRegister
} = require('../validators/authValidator');

// POST /api/auth/login
router.post('/login', validateLogin, validate, authController.login);

// POST /api/auth/register (Only Admin / TPO & Coordinator can provision students)
router.post(
  '/register',
  authenticate,
  requireRole('tpo', 'coordinator'),
  validateRegister,
  validate,
  authController.register
);

// GET /api/auth/me (Current authenticated user profile)
router.get('/me', authenticate, authController.getMe);

// POST /api/auth/first-login-reset (Protected)
router.post(
  '/first-login-reset',
  authenticate,
  validatePasswordReset,
  validate,
  authController.firstLoginReset
);

// POST /api/auth/reset-password (Protected)
router.post(
  '/reset-password',
  authenticate,
  validatePasswordReset,
  validate,
  authController.firstLoginReset
);

module.exports = router;
