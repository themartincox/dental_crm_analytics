import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import secureApiService from '../services/secureApiService';

const SecureAuthContext = createContext({});

export const useSecureAuth = () => {
    const context = useContext(SecureAuthContext);
    if (!context) {
        throw new Error('useSecureAuth must be used within a SecureAuthProvider');
    }
    return context;
};

// F3 - Enhanced authentication with server-side validation
export const SecureAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication status and validate with server
    const checkAuth = async () => {
        try {
            setLoading(true);

            // Check Supabase session
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session?.user) {
                setUser(null);
                setUserProfile(null);
                setIsAuthenticated(false);
                return;
            }

            // Validate with server and get enhanced profile
            try {
                const profile = await secureApiService?.getProfile();

                setUser(session?.user);
                setUserProfile(profile);
                setIsAuthenticated(true);
            } catch (serverError) {
                console.error('Server validation failed:', serverError);
                // If server validation fails, sign out
                await signOut();
            }

        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
            setUserProfile(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    // Sign in with enhanced server validation
    const signIn = async (email, password) => {
        try {
            setLoading(true);

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

            // Server-side validation happens in checkAuth
            await checkAuth();

            return { data, error: null };
        } catch (error) {
            console.error('Sign in error:', error);
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    // Sign out with cleanup
    const signOut = async () => {
        try {
            setLoading(true);

            // Clear local state first
            setUser(null);
            setUserProfile(null);
            setIsAuthenticated(false);

            // Sign out from Supabase
            await supabase.auth.signOut();

        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Role-based permission checking
    const hasRole = (requiredRoles) => {
        if (!userProfile?.role) return false;

        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        return roles?.includes(userProfile?.role);
    };

    // Check if user has clinical data access
    const canAccessClinicalData = () => {
        return hasRole(['super_admin', 'practice_admin', 'dentist', 'hygienist']);
    };

    // Check if user has marketing data access
    const canAccessMarketingData = () => {
        return hasRole(['super_admin', 'practice_admin', 'manager', 'receptionist']);
    };

    // Check if user has admin privileges
    const isAdmin = () => {
        return hasRole(['super_admin', 'practice_admin']);
    };

    // Initialize auth on mount
    useEffect(() => {
        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                setUser(null);
                setUserProfile(null);
                setIsAuthenticated(false);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                await checkAuth();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // API connectivity monitoring
    const [apiHealthy, setApiHealthy] = useState(true);

    useEffect(() => {
        const checkApiHealth = async () => {
            try {
                await secureApiService?.checkApiHealth();
                setApiHealthy(true);
            } catch (error) {
                console.warn('API health check failed:', error);
                setApiHealthy(false);
            }
        };

        // Check API health every 5 minutes if authenticated
        if (isAuthenticated) {
            checkApiHealth();
            const interval = setInterval(checkApiHealth, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const value = {
        user,
        userProfile,
        loading,
        isAuthenticated,
        apiHealthy,
        signIn,
        signOut,
        checkAuth,
        hasRole,
        canAccessClinicalData,
        canAccessMarketingData,
        isAdmin
    };

    return (
        <SecureAuthContext.Provider value={value}>
            {children}
        </SecureAuthContext.Provider>
    );
};

export default SecureAuthProvider;
