import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const UnauthorizedPage = () => {
  const { dashboardRoute } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Access Denied</h1>
      <p className="text-sm text-slate-600 max-w-md mb-6">
        You do not have the required permissions or role to view this page. If you believe this is an error, please switch workspaces or contact platform support.
      </p>
      <Link to={dashboardRoute()}>
        <Button>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Authorized Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
