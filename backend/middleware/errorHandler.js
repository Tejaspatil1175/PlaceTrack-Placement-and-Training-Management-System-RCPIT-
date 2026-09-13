/**
 * Centralized error handling middleware.
 * Formats all application errors into a uniform JSON response structure:
 * {
 *   success: false,
 *   message: string,
 *   errors?: array | object,
 *   stack?: string (only in development)
 * }
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Sequelize specific errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Duplicate entry error: record already exists';
    errors = err.errors ? err.errors.map(e => ({ field: e.path, message: e.message })) : null;
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Database validation failed';
    errors = err.errors ? err.errors.map(e => ({ field: e.path, message: e.message })) : null;
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference: related entity does not exist';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  }

  const responsePayload = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  return res.status(statusCode).json(responsePayload);
};

/**
 * 404 Not Found handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  return res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
