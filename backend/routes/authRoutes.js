const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const { validateLogin, validatePasswordReset } = require('../validators/authValidator');

// POST /api/auth/login
router.post('/login', validateLogin, validate, authController.login);

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
