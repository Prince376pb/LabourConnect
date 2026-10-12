import React from 'react';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`block w-full rounded-lg text-slate-900 border text-sm transition-colors duration-150 py-2.5 px-3.5 bg-white ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
            : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500'
        } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};

export default Select;
