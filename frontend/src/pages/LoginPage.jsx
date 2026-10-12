import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import GoogleSignInButton from '../components/common/GoogleSignInButton';
import { Briefcase, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const { login, dashboardRoute, isAuthenticated, user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already authenticated, redirect immediately to their role dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(dashboardRoute(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate, dashboardRoute]);

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const userData = await login(email.trim(), password);
      success('Logged in successfully!');
      const destination = location.state?.from?.pathname || dashboardRoute(userData);
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      let userMsg = 'Login failed. Please check your credentials and try again.';

      if (err.response?.status === 401 || err.response?.status === 403) {
        userMsg = 'Invalid email address or password. Please verify your credentials.';
      } else if (err.message === 'Network Error' || !err.response) {
        userMsg = 'Unable to connect to the backend server. Please verify the API is running on port 8081.';
      } else if (err.response?.data?.message) {
        userMsg = err.response.data.message;
      }

      setErrorMessage(userMsg);
      toastError(userMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Top Back Navigation */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-teal-600" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2.5 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-xs">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
              Labour<span className="text-teal-600">Connect</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
              Create an account
            </Link>
          </p>
        </div>

        {/* Login Form Container */}
        <div className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs">
          {/* Form-level Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-800 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors({ ...validationErrors, email: '' });
                    }
                  }}
                  className={`block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border text-slate-900 transition-colors ${
                    validationErrors.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white'
                  }`}
                  required
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field with Visibility Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-800">
                  Password <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors({ ...validationErrors, password: '' });
                    }
                  }}
                  className={`block w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border text-slate-900 transition-colors ${
                    validationErrors.password
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{validationErrors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              disabled={loading}
            >
              Sign In
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400 font-medium">Or continue with</span>
              </div>
            </div>

            <GoogleSignInButton label="Sign in with Google" />
          </form>

          {/* Footer inside card */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Need to register as an employer, worker, or service provider?{' '}
              <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
                Get Started
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
