import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  adminOnly?: boolean;
  allowNormalUsers?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission, 
  adminOnly = false,
  allowNormalUsers = false 
}) => {
  const { isAuthenticated, hasPermission, user } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if admin only
  if (adminOnly && user?.email) {
    const adminEmails = ['admin@netqr.io', 'admin@admin.com'];
    if (!adminEmails.includes(user.email)) {
      return <Navigate to="/admin" replace />;
    }
  }

  // Check if user has required permission (only for sub-users unless allowNormalUsers is true)
  if (requiredPermission) {
    // Allow normal users if allowNormalUsers is true
    if (allowNormalUsers && user?.type !== 'subuser') {
      return <>{children}</>;
    }
    
    // Otherwise check permission
    if (!hasPermission(requiredPermission)) {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};
