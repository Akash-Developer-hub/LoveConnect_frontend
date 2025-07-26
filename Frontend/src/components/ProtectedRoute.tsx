import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is paired (required for dashboard access)
  if (user && !user.isPaired) {
    return <Navigate to="/pairing" state={{ email: user.email }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;