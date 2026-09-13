/**
 * Role-based access control middleware factory.
 * Accepts single role, multiple role arguments, or an array of roles.
 * Example:
 *   requireRole('tpo')
 *   requireRole('tpo', 'coordinator')
 *   requireRole(['tpo', 'coordinator'])
 */
const requireRole = (...roles) => {
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] role(s)`
      });
    }

    return next();
  };
};

module.exports = {
  requireRole
};
