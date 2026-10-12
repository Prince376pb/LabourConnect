import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  const { isAuthenticated, dashboardRoute } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-black text-slate-900 tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        The page you are looking for does not exist or has been moved to another location.
      </p>
      <Link to={isAuthenticated ? dashboardRoute() : '/'}>
        <Button>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
