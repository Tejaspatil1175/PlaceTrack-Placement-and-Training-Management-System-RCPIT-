import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authStore';

export function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, user, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // Map 'officer' alias to 'tpo' for role comparison
    const normalizedAllowed = allowedRoles.map((r) =>
      r.toLowerCase() === 'officer' ? 'tpo' : r.toLowerCase()
    );
    const userRole = (role || user.role || '').toLowerCase();
    const normalizedUserRole = userRole === 'officer' ? 'tpo' : userRole;

    if (!normalizedAllowed.includes(normalizedUserRole)) {
      return <Navigate to="/403" replace />;
    }
  }

  return children;
}
