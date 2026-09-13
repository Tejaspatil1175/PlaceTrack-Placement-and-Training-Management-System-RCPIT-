const bcrypt = require('bcryptjs');

/**
 * Hashes a plain-text password using bcrypt.
 * @param {string} password - Plain text password
 * @param {number} [saltRounds=10] - Number of bcrypt salt rounds
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password, saltRounds = 10) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password string is required for hashing');
  }
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compares a plain-text password with a bcrypt hash.
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password to compare against
 * @returns {Promise<boolean>} True if password matches hash, false otherwise
 */
const comparePassword = async (password, hashedPassword) => {
  if (!password || !hashedPassword) {
    return false;
  }
  return bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword
};
