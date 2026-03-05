import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects admin routes. Redirects to /admin/login if not authenticated or not admin.
 */
export default function AdminGuard() {
  const { isAuthenticated, isAdmin, isLoading, userRoleLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="admin-guard-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (userRoleLoading) {
    return (
      <div className="admin-guard-loading">
        <div className="loading-spinner" />
        <p>Verifying access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
