import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', label }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`animate-spin rounded-full border-brand-600 border-t-transparent ${sizeClasses[size]}`}
        role="status"
        aria-label="loading"
      />
      {label && <p className="mt-2 text-sm font-medium text-gray-600">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
