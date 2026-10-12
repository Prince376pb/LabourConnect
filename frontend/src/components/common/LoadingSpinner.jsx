import React from 'react';

const LoadingSpinner = ({ text = 'Loading data...', fullHeight = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${fullHeight ? 'min-h-[60vh]' : 'py-12'}`}>
      <div className="relative">
        <div className="w-10 h-10 border-4 border-teal-100 rounded-full animate-spin border-t-teal-600"></div>
      </div>
      {text && <p className="mt-3 text-sm text-slate-500 font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
