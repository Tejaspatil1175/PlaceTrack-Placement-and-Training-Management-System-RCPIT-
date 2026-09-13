const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generates a signed JWT for a given user payload.
 * @param {object} payload - Data to encode in the token (e.g. { id, role, email, prn })
 * @param {string|number} [expiresIn] - Optional custom expiration (e.g., '1d', '7d', '1h')
 * @returns {string} Signed JWT string
 */
const generateToken = (payload, expiresIn = env.jwt.expiresIn) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Valid payload object is required to generate a token');
  }

  return jwt.sign(payload, env.jwt.secret, {
    expiresIn
  });
};

/**
 * Verifies a JWT and returns the decoded payload.
 * @param {string} token - JWT string to verify
 * @returns {object} Decoded token payload
 * @throws {JsonWebTokenError|TokenExpiredError} If token is invalid or expired
 */
const verifyToken = (token) => {
  if (!token || typeof token !== 'string') {
    throw new Error('Token string is required for verification');
  }

  return jwt.verify(token, env.jwt.secret);
};

module.exports = {
  generateToken,
  verifyToken
};
