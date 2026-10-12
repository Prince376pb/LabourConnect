import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ShieldCheck, Lock, Eye, Trash2, ArrowLeft } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, dashboardRoute } = useAuth();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (isAuthenticated) {
      navigate(dashboardRoute());
    } else {
      navigate('/');
    }
  };

  const backLabel = isAuthenticated ? 'Back to Dashboard' : 'Back to Home';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="mb-4 text-slate-600 hover:text-slate-900 border-slate-300"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {backLabel}
        </Button>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Notice & Data Protection</h1>
        <p className="text-sm text-slate-500 mt-2">
          Last revised: October 2026. Labour Connect is committed to transparent and secure data governance.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <Card>
          <div className="flex items-start space-x-3">
            <Eye className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-2">1. Information We Collect</h3>
              <p className="mb-2">We collect only information necessary to provide the platform's matching and service delivery functions:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li><strong>Identity Information:</strong> Full name, verified email address, phone number.</li>
                <li><strong>Professional Data:</strong> Skills, years of experience, indicative daily/hourly wages, business names.</li>
                <li><strong>Location Information:</strong> City, operational area, and coordinates (only upon explicit browser permission or manual entry).</li>
                <li><strong>Transaction History:</strong> Job applications, service requests, status transitions, and verified ratings.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-2">2. How Your Data Is Protected</h3>
              <p className="mb-2">We implement technical and organizational controls to protect against unauthorized access:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>All user passwords are encrypted using adaptive salt BCrypt hashing.</li>
                <li>All API sessions use cryptographically signed JSON Web Tokens (JWT).</li>
                <li>Administrative provider verification documents are stored securely and never made accessible to the public.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start space-x-3">
            <Trash2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-2">3. User Rights & Account Deletion</h3>
              <p className="text-slate-600">
                Users retain full rights to inspect, update, and request deactivation of their accounts. To request profile deactivation or audit data inspection, contact our administration desk at <span className="font-semibold text-slate-900">support@labourconnect.com</span>.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
