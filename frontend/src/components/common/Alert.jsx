import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

const Alert = ({ type = 'info', title, message, children, className = '' }) => {
  const configs = {
    info: {
      bg: 'bg-teal-50 border-teal-200 text-teal-900',
      icon: <Info className="w-5 h-5 text-teal-600 shrink-0" />
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
    }
  };

  const current = configs[type] || configs.info;

  return (
    <div className={`p-4 rounded-xl border text-sm flex space-x-3 ${current.bg} ${className}`}>
      {current.icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        {message && <p>{message}</p>}
        {children}
      </div>
    </div>
  );
};

export default Alert;
