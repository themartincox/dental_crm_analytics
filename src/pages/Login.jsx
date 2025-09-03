import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('receptionist');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { signIn, signUp, loading, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location?.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Clear previous errors
    setError('');
    setSubmitError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Ensure full_name is provided for sign-up
        const signUpData = {
          full_name: fullName || email?.split('@')?.[0] || 'New User',
          role: role || 'receptionist'
        };
        
        const result = await signUp(email, password, signUpData);
        
        if (result?.error) {
          // Provide user-friendly error messages
          if (result?.error?.message?.includes('Database error saving new user')) {
            setError('Unable to create account. Please try again or contact support.');
          } else if (result?.error?.message?.includes('already registered')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else {
            setError(result?.error?.message || 'Failed to create account');
          }
          return;
        }
        
        setMessage('Account created successfully! Please check your email to verify your account.');
        // Clear form
        setEmail('');
        setPassword('');
        setFullName('');
        setRole('receptionist');
      } else {
        // Use email and password state directly
        const result = await signIn(email, password);
        
        if (result?.error) {
          if (result?.error?.message?.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (result?.error?.message?.includes('missing email or phone')) {
            setError('Please enter both email and password.');
          } else {
            setError(result?.error?.message || 'Failed to sign in');
          }
          return;
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setError('');
      setSubmitError('');
      
      const result = await signIn('admin@dentalcrm.com', 'admin123');
      if (result?.error) {
        setSubmitError('Demo login failed. Please use manual credentials.');
      }
    } catch (err) {
      setSubmitError('Demo login failed. Please use manual credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp ? 'Join your dental practice team' : 'Access your dental CRM dashboard'}
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          {/* Global Error */}
          {(submitError || error || authError?.message || message) && (
            <div className={`border rounded-lg p-4 flex items-start gap-3 ${
              message ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                message ? 'text-green-500' : 'text-red-500'
              }`} />
              <div className={`text-sm ${message ? 'text-green-700' : 'text-red-700'}`}>
                {message || submitError || error || authError?.message}
              </div>
            </div>
          )}

          <div className="space-y-5">
            {/* Full Name for Sign Up */}
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e?.target?.value)}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e?.target?.value)}
                  className={errors?.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                  placeholder="Enter your email"
                />
                <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              {errors?.email && (
                <p className="mt-1 text-sm text-red-600">{errors?.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e?.target?.value)}
                  className={errors?.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors?.password && (
                <p className="mt-1 text-sm text-red-600">{errors?.password}</p>
              )}
            </div>

            {/* Role for Sign Up */}
            {isSignUp && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e?.target?.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="receptionist">Receptionist</option>
                  <option value="dentist">Dentist</option>
                  <option value="hygienist">Hygienist</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            )}
          </div>

          {/* Remember Me */}
          {!isSignUp && (
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e?.target?.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              disabled={loading || isLoading}
              className="w-full flex justify-center py-3 px-4 text-sm font-medium"
            >
              {loading || isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  <Lock className="-ml-1 mr-2 h-4 w-4" />
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </Button>
          </div>

          {/* Demo Login Button */}
          {!isSignUp && (
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={handleDemoLogin}
                disabled={loading || isLoading}
                className="w-full flex justify-center py-3 px-4 text-sm font-medium"
              >
                Try Demo Account
              </Button>
            </div>
          )}

          {/* Toggle Form */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
                setSubmitError('');
                setError('');
                setMessage('');
              }}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              {isSignUp
                ? 'Already have an account? Sign in' :'Need an account? Sign up'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;