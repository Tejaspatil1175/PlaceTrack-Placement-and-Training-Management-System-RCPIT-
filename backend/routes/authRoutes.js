const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/first-login-reset (Protected)
router.post('/first-login-reset', authenticate, authController.firstLoginReset);

// POST /api/auth/reset-password (Protected)
router.post('/reset-password', authenticate, authController.firstLoginReset);

module.exports = router;
