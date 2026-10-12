import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Briefcase, Users, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

const TermsPage = () => {
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="mb-4 text-slate-600 hover:text-slate-900 border-slate-300"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {backLabel}
        </Button>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
        <p className="text-sm text-slate-500 mt-2">
          Effective date: October 2026. Governing rules for using Labour Connect.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
        <Card className="p-6">
          <div className="flex items-start space-x-3">
            <Briefcase className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-2">1. Platform Scope & Purpose</h3>
              <p className="text-slate-600 leading-relaxed">
                Labour Connect provides a digital directory and matchmaking platform operating two distinct modules:
                <strong> Employment Connect</strong> (linking employers, contractors, and skilled daily-wage workers) and
                <strong> On-Demand Service Connect</strong> (linking households with independent verified local service technicians).
                Labour Connect serves as a technology facilitator and does not directly employ workers or guarantee job outcomes.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start space-x-3">
            <Users className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-2">2. User Accounts & Responsibilities</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Users must register with genuine identity details, a valid email address, and an active phone number.</li>
                <li>Employers and contractors agree to accurately post wage rates, work locations, and job scope.</li>
                <li>Workers and service providers agree to represent their genuine trade skills, certifications, and availability.</li>
                <li>Account credentials must be safeguarded. Users are responsible for all activities conducted under their credentials.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-2">3. Service Execution & Payment Terms</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>In-person service fees and wage settlements are agreed between the customer/employer and provider/worker based on quoted rates.</li>
                <li>Customers agree to inspect work upon completion before settling payments.</li>
                <li>Ratings and reviews must reflect genuine service experiences. Defamatory or fraudulent reviews are prohibited.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-2">4. Dispute Resolution & Platform Governance</h3>
              <p className="text-slate-600 leading-relaxed">
                Labour Connect maintains an administrative dispute resolution desk. If an appointment delay, quality issue, or fee discrepancy arises, registered customers or providers may lodge a formal complaint. Administrators review audit logs, mediate disputes objectively, and reserve the right to suspend or terminate accounts that breach platform safety guidelines.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-50 border-slate-200">
          <h4 className="font-bold text-slate-900 mb-1">Contact & Support</h4>
          <p className="text-xs text-slate-600">
            For questions regarding these terms, contact platform administration at{' '}
            <span className="font-semibold text-slate-900">support@labourconnect.com</span>.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;
