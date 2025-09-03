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
      // Use maybeSingle() instead of single() to handle cases where no profile exists
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.maybeSingle()

      if (error) {
        console.error('Error fetching user profile:', error)
        setError(error)
        return
      }

      // If no profile exists, try to create one using the new helper function
      if (!data) {
        console.warn('No user profile found for user ID:', userId)
        
        // Get the current user's auth data
        const { data: { user } } = await supabase?.auth?.getUser()
        
        if (user) {
          // Use the new helper function to safely create/retrieve profile
          const { data: profileData, error: profileError } = await supabase?.rpc('ensure_user_profile', {
            user_id: userId,
            user_email: user?.email,
            user_full_name: user?.user_metadata?.full_name || user?.user_metadata?.fullName || user?.email?.split('@')?.[0] || 'Unknown User',
            user_role: user?.user_metadata?.role || 'receptionist'
          })

          if (profileError) {
            console.error('Error creating/retrieving user profile:', profileError)
            
            // Fallback: try direct insert with ON CONFLICT handling
            const { data: fallbackProfile, error: fallbackError } = await supabase?.from('user_profiles')?.upsert({
              id: userId,
              email: user?.email,
              full_name: user?.user_metadata?.full_name || user?.user_metadata?.fullName || user?.email?.split('@')?.[0] || 'Unknown User',
              role: user?.user_metadata?.role || 'receptionist',
              is_active: true
            }, {
              onConflict: 'email',
              ignoreDuplicates: false
            })?.select()?.single()

            if (fallbackError) {
              console.error('Fallback profile creation also failed:', fallbackError)
              setError(fallbackError)
              return
            }

            setUserProfile(fallbackProfile)
            return
          }

          setUserProfile(profileData)
          return
        }
        
        // If we can't create a profile, set error state
        const profileError = new Error('User profile not found and could not be created')
        setError(profileError)
        return
      }

      setUserProfile(data)
    } catch (err) {
      console.error('Error in fetchUserProfile:', err)
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