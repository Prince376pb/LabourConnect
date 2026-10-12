import React from 'react';

const Badge = ({ children, color = 'bg-slate-100 text-slate-800 border-slate-200', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
