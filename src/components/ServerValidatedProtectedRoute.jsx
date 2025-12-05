import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSecureAuth } from '../contexts/SecureAuthContext';
import secureApiService from '../services/secureApiService';

// F3 Resolution - Server-validated protected route component
const ServerValidatedProtectedRoute = ({ 
    children, 
    requiredRoles = [], 
    requireAuth = true,
    requireClinicalAccess = false,
    requireMarketingAccess = false,
    requireAdminAccess = false,
    bypassServerValidation = false // For emergency access
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
    const [serverValidation, setServerValidation] = useState(null);
    const [validating, setValidating] = useState(false);
    const [validationError, setValidationError] = useState(null);

    // F3 - Server-side validation
    useEffect(() => {
        const performServerValidation = async () => {
            if (!isAuthenticated || bypassServerValidation || loading) {
                return;
            }

            try {
                setValidating(true);
                setValidationError(null);

                // Determine primary required role
                let primaryRole = null;
                if (requireAdminAccess) primaryRole = 'super_admin';
                else if (requireClinicalAccess) primaryRole = 'dentist';
                else if (requireMarketingAccess) primaryRole = 'manager';
                else if (requiredRoles?.length > 0) primaryRole = requiredRoles?.[0];

                // Call server-side validation
                const validation = await secureApiService?.validateServerSideAccess(
                    primaryRole,
                    [
                        .(requireClinicalAccess ? ['clinical_data_access'] : []),
                        .(requireMarketingAccess ? ['marketing_data_access'] : []),
                        .(requireAdminAccess ? ['admin_access'] : [])
                    ]
                );

                setServerValidation(validation);

                // If validation fails, log the security event
                if (!validation?.valid) {
                    console.warn('Server-side validation failed:', validation);
                }

            } catch (error) {
                console.error('Server validation error:', error);
                setValidationError(error?.message);
                setServerValidation({ valid: false, error: error?.message });
            } finally {
                setValidating(false);
            }
        };

        // Only validate if client-side checks would pass
        const clientSideValid = !requireAuth || (
            isAuthenticated && 
            (!requireAdminAccess || isAdmin()) &&
            (!requireClinicalAccess || canAccessClinicalData()) &&
            (!requireMarketingAccess || canAccessMarketingData()) &&
            (requiredRoles?.length === 0 || hasRole(requiredRoles))
        );

        if (clientSideValid && !bypassServerValidation) {
            performServerValidation();
        }
    }, [
        isAuthenticated, 
        userProfile?.role, 
        requiredRoles, 
        requireAdminAccess, 
        requireClinicalAccess, 
        requireMarketingAccess,
        bypassServerValidation,
        location?.pathname
    ]);

    // Show loading state
    if (loading || validating) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="text-muted-foreground">
                        {loading ? 'Checking authentication.' : 'Validating server access.'}
                    </span>
                </div>
            </div>
        );
    }

    // Check API connectivity (F3 requirement)
    if (!apiHealthy && isAuthenticated && !bypassServerValidation) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
                    <h2 className="text-2xl font-bold text-red-800 mb-4">
                        🔒 Security Service Unavailable
                    </h2>
                    <p className="text-red-700 mb-4">
                        The server-side security validation service is currently unavailable. 
                        For security compliance (F3), access is restricted until the service is restored.
                    </p>
                    <p className="text-sm text-red-600 mb-6">
                        This enforces server-side RBAC validation as required by security finding F3.
                    </p>
                    <button 
                        onClick={() => window.location?.reload()} 
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 mr-2"
                    >
                        Retry Connection
                    </button>
                    <button 
                        onClick={() => window.history?.back()} 
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // F3 - Server-side validation check (critical security requirement)
    if (!bypassServerValidation && serverValidation && !serverValidation?.valid) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
                    <h2 className="text-2xl font-bold text-red-800 mb-4">
                        🔒 Server-Side Access Denied
                    </h2>
                    <p className="text-red-700 mb-4">
                        Server-side validation failed. This implements proper RBAC enforcement 
                        as required by security finding F3.
                    </p>
                    <div className="text-sm text-red-600 mb-6 space-y-2">
                        <p><strong>User:</strong> {userProfile?.full_name}</p>
                        <p><strong>Role:</strong> {userProfile?.role}</p>
                        <p><strong>Required Access:</strong> {
                            requireAdminAccess ? 'Administrator' : requireClinicalAccess ?'Clinical Data': requireMarketingAccess ?'Marketing Data': requiredRoles?.join(', ') || 'Standard'
                        }</p>
                        <p><strong>Server Response:</strong> {serverValidation?.error}</p>
                    </div>
                    <div className="space-y-2">
                        <button 
                            onClick={() => window.history?.back()} 
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 mr-2"
                        >
                            Go Back
                        </button>
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Server validation error (system issue)
    if (validationError && !bypassServerValidation) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h2 className="text-2xl font-bold text-yellow-800 mb-4">
                        ⚠️ Security Validation Error
                    </h2>
                    <p className="text-yellow-700 mb-4">
                        Unable to validate server-side permissions. For security compliance, 
                        access is restricted until validation succeeds.
                    </p>
                    <p className="text-sm text-yellow-600 mb-6">
                        Error: {validationError}
                    </p>
                    <div className="space-y-2">
                        <button 
                            onClick={() => {
                                setValidationError(null);
                                window.location?.reload();
                            }} 
                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 mr-2"
                        >
                            Retry Validation
                        </button>
                        <button 
                            onClick={() => window.history?.back()} 
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Client-side role validation (backup layer)
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
                        <p><strong>User ID:</strong> {user?.id?.substring(0, 8)}.</p>
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

    // Additional specific access checks with server validation confirmation
    if (requireClinicalAccess && (!canAccessClinicalData() || (serverValidation && !serverValidation?.valid))) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h2 className="text-2xl font-bold text-blue-800 mb-4">
                        🏥 Clinical Data Access Required
                    </h2>
                    <p className="text-blue-700 mb-4">
                        This page contains clinical patient data that requires special permissions 
                        validated by both client and server (F3 compliance).
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

    // All security checks passed - render the protected content
    return (
        <>
            {/* F3 Security indicator for compliance verification */}
            {process.env?.NODE_ENV === 'development' && serverValidation?.valid && (
                <div className="bg-green-50 border-l-4 border-green-400 p-2 text-xs text-green-700">
                    ✅ F3 Compliance: Server-side RBAC validation passed - Role: {serverValidation?.userRole} 
                    | Access: {serverValidation?.access_level}
                </div>
            )}
            {children}
        </>
    );
};

export default ServerValidatedProtectedRoute;