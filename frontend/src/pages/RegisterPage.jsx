import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import GoogleSignInButton from '../components/common/GoogleSignInButton';
import { Briefcase, Lock, Mail, User, Phone, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();

  const sanitizeRole = (r) => {
    if (!r) return 'WORKER';
    const clean = r.replace(/^ROLE_/i, '').toUpperCase();
    return ['WORKER', 'EMPLOYER', 'CUSTOMER', 'PROVIDER'].includes(clean) ? clean : 'WORKER';
  };

  const [role, setRole] = useState(() => sanitizeRole(searchParams.get('role')));
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const { register, dashboardRoute, isAuthenticated, user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(dashboardRoute(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate, dashboardRoute]);

  useEffect(() => {
    const qRole = searchParams.get('role');
    if (qRole) setRole(sanitizeRole(qRole));
  }, [searchParams]);

  const validate = () => {
    const errors = {};
    if (!fullName.trim()) {
      errors.fullName = 'Full Name or Business Name is required.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
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
      const userData = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password,
        role: `ROLE_${role}`
      });

      success('Account created successfully! Welcome to Labour Connect.');
      navigate(dashboardRoute(userData));
    } catch (err) {
      console.error('Registration error:', err);
      let userMsg = 'Registration failed. Please check the provided information.';
      if (err.response?.data?.message) {
        userMsg = err.response.data.message;
      } else if (err.message === 'Network Error' || !err.response) {
        userMsg = 'Unable to connect to the backend server. Please verify the API is running on port 8081.';
      }
      setErrorMessage(userMsg);
      toastError(userMsg);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { id: 'WORKER', title: 'Skilled Worker', desc: 'Find daily wage & contract jobs' },
    { id: 'EMPLOYER', title: 'Employer / Contractor', desc: 'Post jobs & hire skilled wage workers' },
    { id: 'CUSTOMER', title: 'Household Customer', desc: 'Book verified local on-demand services' },
    { id: 'PROVIDER', title: 'Service Provider', desc: 'Offer trade services & repairs' },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-xl w-full space-y-6">
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

        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2.5 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-xs">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
              Labour<span className="text-teal-600">Connect</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create your Account</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Choose your account role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRole(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === opt.id
                        ? 'border-teal-600 bg-teal-50/70 ring-1 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">{opt.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-800 mb-1.5">
                Full Name or Business Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="reg-name"
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border text-slate-900 transition-colors ${
                    validationErrors.fullName
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white'
                  }`}
                  required
                />
              </div>
              {validationErrors.fullName && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{validationErrors.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

              {/* Phone */}
              <div>
                <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="+91-9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={`block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border text-slate-900 transition-colors ${
                      validationErrors.phoneNumber
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white'
                    }`}
                    required
                  />
                </div>
                {validationErrors.phoneNumber && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{validationErrors.phoneNumber}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label htmlFor="reg-pass" className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-pass"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{validationErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="reg-confirm" className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border text-slate-900 transition-colors ${
                      validationErrors.confirmPassword
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              disabled={loading}
            >
              Create Account
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400 font-medium">Or continue with</span>
              </div>
            </div>

            <GoogleSignInButton label="Sign up with Google" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
