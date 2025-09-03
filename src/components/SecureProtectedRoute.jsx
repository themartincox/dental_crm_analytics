import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSecureAuth } from '../contexts/SecureAuthContext';

// F3 - Enhanced protected route with server-side RBAC validation
const SecureProtectedRoute = ({ 
    children, 
    requiredRoles = [], 
    requireAuth = true,
    requireClinicalAccess = false,
    requireMarketingAccess = false,
    requireAdminAccess = false 
}) => {
    const { 
        user, 
        userProfile, 
        loading, 
        isAuthenticated, 
        apiHealthy,
        hasRole,
        canAccessClinicalData,
        canAccessMarketingData,
        isAdmin
    } = useSecureAuth();
    
    const location = useLocation();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="text-muted-foreground">Verifying secure access...</span>
                </div>
            </div>
        );
    }

    // Check API connectivity
    if (!apiHealthy && isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
                    <h2 className="text-2xl font-bold text-red-800 mb-4">
                        Security Service Unavailable
                    </h2>
                    <p className="text-red-700 mb-4">
                        The secure API service is currently unavailable. For security reasons, access is restricted until the service is restored.
                    </p>
                    <p className="text-sm text-red-600 mb-6">
                        Please contact your system administrator or try again later.
                    </p>
                    <button 
                        onClick={() => window.location?.reload()} 
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based authorization
    if (requiredRoles?.length > 0 && !hasRole(requiredRoles)) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h2 className="text-2xl font-bold text-yellow-800 mb-4">
                        Access Denied
                    </h2>
                    <p className="text-yellow-700 mb-4">
                        You don't have the required permissions to access this page.
                    </p>
                    <div className="text-sm text-yellow-600 mb-6 space-y-2">
                        <p><strong>Required roles:</strong> {requiredRoles?.join(', ')}</p>
                        <p><strong>Your role:</strong> {userProfile?.role || 'No role assigned'}</p>
                        <p><strong>User ID:</strong> {user?.id?.substring(0, 8)}...</p>
                    </div>
                    <div className="space-y-2">
                        <button 
                            onClick={() => window.history?.back()} 
                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 mr-2"
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

    // Check clinical data access requirement
    if (requireClinicalAccess && !canAccessClinicalData()) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h2 className="text-2xl font-bold text-blue-800 mb-4">
                        Clinical Data Access Required
                    </h2>
                    <p className="text-blue-700 mb-4">
                        This page contains clinical patient data that requires special permissions to access.
                    </p>
                    <p className="text-sm text-blue-600 mb-6">
                        Only dentists, hygienists, and clinical administrators can view this information.
                    </p>
                    <button 
                        onClick={() => window.history?.back()} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Check marketing data access requirement
    if (requireMarketingAccess && !canAccessMarketingData()) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 bg-purple-50 border border-purple-200 rounded-lg">
                    <h2 className="text-2xl font-bold text-purple-800 mb-4">
                        Marketing Data Access Required
                    </h2>
                    <p className="text-purple-700 mb-4">
                        This page contains marketing and lead data that requires appropriate permissions.
                    </p>
                    <p className="text-sm text-purple-600 mb-6">
                        Contact your administrator for access to marketing features.
                    </p>
                    <button 
                        onClick={() => window.history?.back()} 
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Check admin access requirement
    if (requireAdminAccess && !isAdmin()) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
                    <h2 className="text-2xl font-bold text-red-800 mb-4">
                        Administrator Access Required
                    </h2>
                    <p className="text-red-700 mb-4">
                        This page contains sensitive system administration features.
                    </p>
                    <p className="text-sm text-red-600 mb-6">
                        Only system administrators can access this area.
                    </p>
                    <button 
                        onClick={() => window.history?.back()} 
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // All checks passed - render the protected content
    return children;
};

export default SecureProtectedRoute;