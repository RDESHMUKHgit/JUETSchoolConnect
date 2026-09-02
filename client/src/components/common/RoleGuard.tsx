import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';
import { LoadingSpinner } from '../ui/LoadingSpinner.js';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  allowPending?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  allowPending = false,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Authenticating session..." />;
  }

  // Not logged in
  if (!user) {
    if (allowedRoles.includes('ADMIN')) {
      return <Navigate to="/admin" replace state={{ from: location }} />;
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role mismatch
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'PRINCIPAL') return <Navigate to="/principal" replace />;
    if (user.role === 'TEACHER') return <Navigate to="/teacher" replace />;
    if (user.role === 'STUDENT') return <Navigate to="/student" replace />;
    return <Navigate to="/" replace />;
  }

  // Check Onboarding State Machine & Status
  const currentPath = location.pathname;

  // 1. NOT COMPLETED -> Redirect to profile setup
  if (user.status === 'NOT COMPLETED') {
    const setupPath = `/${user.role.toLowerCase()}/profile-setup`;
    if (currentPath !== setupPath) {
      return <Navigate to={setupPath} replace />;
    }
  }

  // 2. COMPLETED (Principal only) -> Redirect to school setup
  if (user.role === 'PRINCIPAL' && user.status === 'COMPLETED') {
    const schoolSetupPath = '/principal/school-setup';
    if (currentPath !== schoolSetupPath) {
      return <Navigate to={schoolSetupPath} replace />;
    }
  }

  // 3. PENDING -> Redirect to verification screen unless currently on verification screen or allowPending is true
  if (user.status === 'PENDING' && !allowPending) {
    const verificationPath = `/${user.role.toLowerCase()}/verification`;
    if (currentPath !== verificationPath) {
      return <Navigate to={verificationPath} replace />;
    }
  }

  // 4. VERIFIED -> If user tries to visit setup or verification page, send to their main dashboard
  if (
    user.status === 'VERIFIED' &&
    (currentPath.includes('profile-setup') ||
      currentPath.includes('school-setup') ||
      currentPath.includes('verification'))
  ) {
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }

  return <>{children}</>;
};
