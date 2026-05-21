import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-normal text-text-primary mb-1 font-sans">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 text-sm font-sans border border-border rounded-button bg-white text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${error ? 'border-crimson' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-crimson font-sans">{error}</p>
      )}
    </div>
  );
}