import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ⚠️ PROTECTED FUNCTION - DO NOT MODIFY OR ADD ASYNC OPERATIONS
  // This is a Supabase auth state change listener that must remain synchronous
  const handleAuthStateChange = (event, session) => {
    // SYNC OPERATIONS ONLY - NO ASYNC/AWAIT ALLOWED
    if (session?.user) {
      setUser(session?.user)
      // Fetch user profile after setting user
      fetchUserProfile(session?.user?.id)
    } else {
      setUser(null)
      setUserProfile(null)
    }
    setLoading(false)
  }

  // Separate async function for fetching user profile
  const fetchUserProfile = async (userId) => {
    try {
      // CHANGED: Use the ensure_user_profile function directly first to avoid RLS issues
      // This function bypasses RLS with SECURITY DEFINER
      const { data: userData } = await supabase?.auth?.getUser()
      
      if (userData?.user) {
        const { data: profileData, error: profileError } = await supabase?.rpc('ensure_user_profile', {
          user_id: userId,
          user_email: userData?.user?.email,
          user_full_name: userData?.user?.user_metadata?.full_name || 
                          userData?.user?.user_metadata?.fullName || 
                          userData?.user?.user_metadata?.name || 
                          userData?.user?.email?.split('@')?.[0] || 
                          'Unknown User',
          user_role: userData?.user?.user_metadata?.role || 'receptionist'
        })

        if (profileError) {
          console.error('Error with ensure_user_profile function:', profileError)
          
          // FALLBACK: Try direct query as last resort
          const { data: directData, error: directError } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.maybeSingle()
          
          if (directError) {
            console.error('Direct profile fetch also failed:', directError)
            setError(directError)
            return
          }
          
          if (directData) {
            setUserProfile(directData)
            return
          }
          
          // If all methods fail, set a meaningful error
          const finalError = new Error('Unable to fetch or create user profile')
          setError(finalError)
          return
        }

        setUserProfile(profileData)
        return
      }
      
      // If no user data available, set error
      const noUserError = new Error('No authenticated user found')
      setError(noUserError)
      
    } catch (err) {
      console.error('Error in fetchUserProfile:', err)
      
      // Check if this is the specific infinite recursion error
      if (err?.code === '42P17' || err?.message?.includes('infinite recursion')) {
        console.warn('Infinite recursion detected - using fallback approach')
        
        // Try to get minimal user data without triggering RLS
        try {
          const { data: { user } } = await supabase?.auth?.getUser()
          if (user) {
            // Create minimal profile object from auth user data
            const minimalProfile = {
              id: user?.id,
              email: user?.email,
              full_name: user?.user_metadata?.full_name || user?.email?.split('@')?.[0] || 'Unknown User',
              role: user?.user_metadata?.role || 'receptionist',
              is_active: true
            }
            setUserProfile(minimalProfile)
            return
          }
        } catch (fallbackErr) {
          console.error('Fallback approach also failed:', fallbackErr)
        }
      }
      
      setError(err)
    }
  }

  useEffect(() => {
    // Get initial session - Use Promise chain
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session?.user)
          fetchUserProfile(session?.user?.id)
        }
        setLoading(false)
      })?.catch((error) => {
        console.error('Error getting session:', error)
        setError(error)
        setLoading(false)
      })

    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(handleAuthStateChange)

    return () => subscription?.unsubscribe()
  }, [])

  // Auth methods
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      setError(error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase?.auth?.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window?.location?.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Google sign in error:', error)
      setError(error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      // Ensure required metadata for database trigger
      const requiredMetadata = {
        full_name: metadata?.full_name || metadata?.fullName || email?.split('@')?.[0] || 'Unknown User',
        role: metadata?.role || 'receptionist',
        ...metadata
      }
      
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: requiredMetadata
        }
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      setError(error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase?.auth?.signOut()
      
      if (error) throw error

      // Clear state immediately
      setUser(null)
      setUserProfile(null)
      
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      setError(error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window.location?.origin}/reset-password`
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      setError(error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in')
      
      setLoading(true)
      setError(null)

      // Update user profile in user_profiles table
      const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', user?.id)?.select()?.single()

      if (error) throw error

      setUserProfile(data)
      return { data, error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      setError(error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: userProfile?.role === 'super_admin' || userProfile?.role === 'practice_admin',
    isDentist: userProfile?.role === 'dentist',
    isStaff: ['super_admin', 'practice_admin', 'dentist', 'hygienist', 'receptionist', 'manager']?.includes(userProfile?.role)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}