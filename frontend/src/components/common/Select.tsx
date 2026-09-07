import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full h-9 px-3 text-sm bg-white border rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
            error ? 'border-rose-500' : 'border-slate-300'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
