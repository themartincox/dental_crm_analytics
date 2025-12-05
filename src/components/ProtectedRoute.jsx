import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRoles = [], requireAuth = true }) => {
  const { user, userProfile, loading, isAuthenticated } = useAuth();
  // Be defensive: fall back to user presence if isAuthenticated isn't provided
  const authed = typeof isAuthenticated === 'boolean' ? isAuthenticated : !!user;
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Checking access.</span>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !authed) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based authorization
  if (requiredRoles?.length > 0 && userProfile?.role) {
    const hasRequiredRole = requiredRoles?.includes(userProfile?.role);
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Access Denied
            </h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Required roles: {requiredRoles?.join(', ')}
              <br />
              Your role: {userProfile?.role || 'No role assigned'}
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => window.history?.back()} 
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 mr-2"
              >
                Go Back
              </button>
              <button 
                onClick={() => window.location.href = '/'} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
