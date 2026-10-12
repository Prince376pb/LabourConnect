import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Briefcase, 
  User, 
  Home, 
  Wrench, 
  Phone, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  Info, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

const GoogleSignInButton = ({ label = 'Continue with Google', className = '' }) => {
  const { googleAuth, dashboardRoute } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCompleteRegModal, setShowCompleteRegModal] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);

  // Data passed from Google when registration is needed
  const [pendingToken, setPendingToken] = useState('');
  const [googleProfile, setGoogleProfile] = useState({ email: '', fullName: '' });

  // Registration modal form state
  const [selectedRole, setSelectedRole] = useState('WORKER');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formError, setFormError] = useState('');

  // Developer token testing
  const [devTokenInput, setDevTokenInput] = useState('');
  const [devTokenLoading, setDevTokenLoading] = useState(false);

  const googleButtonContainerRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';

  // Safe diagnostic reporting (Requirement 4: never prints complete Client ID, passwords, or tokens)
  useEffect(() => {
    const isPresent = Boolean(clientId && clientId.length > 0);
    const isExpectedFormat = Boolean(
      isPresent && /^[0-9]+-[a-zA-Z0-9_.-]+\.apps\.googleusercontent\.com$/.test(clientId)
    );
    console.info(`[Google Auth Diagnostic] Frontend Client ID present: ${isPresent}, Valid format: ${isExpectedFormat}`);
  }, [clientId]);

  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      toastError('Google Sign-In failed to return a valid credential.');
      return;
    }

    setLoading(true);
    try {
      const res = await googleAuth({ idToken: response.credential });
      if (res.needsRegistration) {
        setPendingToken(response.credential);
        setGoogleProfile({
          email: res.email || '',
          fullName: res.fullName || ''
        });
        setShowCompleteRegModal(true);
      } else {
        success('Signed in with Google successfully!');
        navigate(dashboardRoute(res), { replace: true });
      }
    } catch (err) {
      console.error('Google authentication error:', err);
      const msg = err.response?.data?.message || err.message || 'Google authentication failed.';
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) return;

    // Load Google Identity Services script if not already loaded
    const scriptId = 'google-gsi-client';
    let script = document.getElementById(scriptId);

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleButtonContainerRef.current) {
            googleButtonContainerRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleButtonContainerRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: 360,
            });
            setGsiReady(true);
          }
        } catch (e) {
          console.error('[Google Auth] Error initializing Google Identity Services:', e);
        }
      }
    };

    let checkInterval = null;
    let attempts = 0;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.body.appendChild(script);
    } else {
      if (window.google?.accounts?.id) {
        initGsi();
      } else {
        script.addEventListener('load', initGsi);
      }
    }

    // Safety fallback: poll in case script was already loaded in SPA navigation
    if (!window.google?.accounts?.id) {
      checkInterval = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initGsi();
        } else if (attempts >= 40) {
          clearInterval(checkInterval);
        }
      }, 100);
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [clientId]);

  const handleCustomButtonClick = () => {
    if (!clientId) {
      setShowConfigModal(true);
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.warn('[Google Auth] One Tap prompt could not be displayed:', notification.getNotDisplayedReason());
          }
        });
      } catch (err) {
        console.error('[Google Auth] Prompt failed:', err);
      }
    } else {
      toastError('Google Identity Services is initializing. Please wait a moment.');
    }
  };

  const handleDevTokenSubmit = async (e) => {
    e.preventDefault();
    if (!devTokenInput.trim()) return;

    setDevTokenLoading(true);
    try {
      const res = await googleAuth({ idToken: devTokenInput.trim() });
      if (res.needsRegistration) {
        setPendingToken(devTokenInput.trim());
        setGoogleProfile({
          email: res.email || '',
          fullName: res.fullName || ''
        });
        setShowConfigModal(false);
        setShowCompleteRegModal(true);
      } else {
        success('Signed in with Google successfully!');
        setShowConfigModal(false);
        navigate(dashboardRoute(res), { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Token verification failed.';
      toastError(msg);
    } finally {
      setDevTokenLoading(false);
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!phoneNumber.trim()) {
      setFormError('Phone number is required for Labour Connect verification.');
      return;
    }

    setLoading(true);
    try {
      const res = await googleAuth({
        idToken: pendingToken,
        role: `ROLE_${selectedRole}`,
        phoneNumber: phoneNumber.trim(),
        fullName: googleProfile.fullName.trim()
      });

      success('Account created successfully! Welcome to Labour Connect.');
      setShowCompleteRegModal(false);
      navigate(dashboardRoute(res), { replace: true });
    } catch (err) {
      console.error('Registration completion error:', err);
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      setFormError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      id: 'WORKER',
      title: 'Daily-Wage Worker',
      desc: 'Browse construction, general labour & daily-wage opportunities',
      icon: Briefcase,
    },
    {
      id: 'EMPLOYER',
      title: 'Employer / Contractor',
      desc: 'Post employment jobs and hire workers for projects',
      icon: User,
    },
    {
      id: 'CUSTOMER',
      title: 'Household Customer',
      desc: 'Book local home services (plumbers, electricians, cleaners)',
      icon: Home,
    },
    {
      id: 'PROVIDER',
      title: 'Service Provider',
      desc: 'Offer verified on-demand professional trade services',
      icon: Wrench,
    },
  ];

  return (
    <div className={`w-full ${className}`}>
      {/* If Google Client ID is configured, render official Google Identity Services button */}
      {clientId ? (
        <div className="w-full flex flex-col items-center">
          <div className="relative w-full flex justify-center min-h-[44px]">
            <div ref={googleButtonContainerRef} className="w-full flex justify-center" />
            {!gsiReady && (
              <div className="absolute inset-0 flex items-center justify-center space-x-3 px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-sm font-medium shadow-xs">
                <svg className="w-4 h-4 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading Google Sign-In...</span>
              </div>
            )}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 text-center">
            Secured by Google Identity Services
          </p>
        </div>
      ) : (
        /* Fallback Button with Google SVG Icon when Client ID is unconfigured */
        <button
          type="button"
          onClick={handleCustomButtonClick}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 px-4 py-2.5 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all shadow-xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 active:bg-slate-100 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{label}</span>
        </button>
      )}

      {/* MODAL 1: Google OAuth Configuration Guide (Only opened when Client ID is missing) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Google Sign-In Integration</h3>
                <p className="text-xs text-slate-500">Google Identity Services setup guide</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Google Client ID is not configured yet.</span> To enable direct 1-click Google Sign-In with real Google accounts:
                </div>
              </div>

              <div className="space-y-2.5 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <div className="font-semibold text-slate-800 text-xs">Easy Setup Steps:</div>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 leading-relaxed">
                  <li>Visit the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-teal-600 underline font-semibold inline-flex items-center">Google Cloud Console <ExternalLink className="w-3 h-3 ml-0.5" /></a>.</li>
                  <li>Create an <strong>OAuth 2.0 Web Client ID</strong>.</li>
                  <li>Add Authorized JavaScript origin: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">http://localhost:5173</code></li>
                  <li>In <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">frontend/.env</code>, add:
                    <div className="mt-1 font-mono bg-slate-800 text-emerald-400 p-2 rounded text-[11px]">
                      VITE_GOOGLE_CLIENT_ID=&lt;your-client-id&gt;.apps.googleusercontent.com
                    </div>
                  </li>
                  <li>In <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">backend/.env</code>, add:
                    <div className="mt-1 font-mono bg-slate-800 text-emerald-400 p-2 rounded text-[11px]">
                      GOOGLE_CLIENT_ID=&lt;your-client-id&gt;.apps.googleusercontent.com
                    </div>
                  </li>
                </ol>
              </div>

              {/* Developer Test Token Input */}
              <div className="pt-2">
                <div className="font-semibold text-slate-800 mb-1">Developer / Testing Token:</div>
                <p className="text-[11px] text-slate-500 mb-2">
                  If you have a Google ID token from OAuth playground or Google API Explorer, you can test it directly:
                </p>
                <form onSubmit={handleDevTokenSubmit} className="space-y-2">
                  <textarea
                    rows={2}
                    value={devTokenInput}
                    onChange={(e) => setDevTokenInput(e.target.value)}
                    placeholder="Paste a Google ID Token JWT (e.g. eyJhbGciOiJSUzI1NiIs...)"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-mono focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowConfigModal(false)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={devTokenLoading || !devTokenInput.trim()}
                      className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 disabled:opacity-50"
                    >
                      {devTokenLoading ? 'Verifying...' : 'Test Token'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: New Google User Registration Completion (Role Choice & Phone) */}
      {showCompleteRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setShowCompleteRegModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-teal-600 mb-3 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Complete Your Account</h3>
              <p className="text-xs text-slate-500 mt-1">
                Welcome to Labour Connect! Select how you plan to use the platform.
              </p>
            </div>

            {/* Google Profile Badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-5 flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                {googleProfile.fullName ? googleProfile.fullName.charAt(0).toUpperCase() : 'G'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">{googleProfile.fullName || 'Google User'}</div>
                <div className="text-[11px] text-slate-500 truncate">{googleProfile.email}</div>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full shrink-0">
                Google Verified
              </span>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="font-medium">{formError}</div>
              </div>
            )}

            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Select Your Account Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {roleOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedRole === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedRole(opt.id)}
                        className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-600 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white text-slate-900"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Required for direct job coordination and booking notifications.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>Creating your profile...</span>
                  ) : (
                    <>
                      <span>Complete Registration & Continue</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;
