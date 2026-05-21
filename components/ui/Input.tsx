import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export default function Input({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return 'border-crimson';
    if (isFocused) return 'border-primary';
    return 'border-border hover:border-text-tertiary';
  };

  const getFocusRing = () => {
    if (error) return 'focus:ring-crimson/20';
    if (isFocused) return 'focus:ring-primary/20';
    return '';
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-normal text-text-primary mb-1 font-sans">
          {label}
          {props.required && <span className="text-crimson ml-1">*</span>}
        </label>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-text-tertiary font-sans">{hint}</p>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-3 py-2 text-sm font-sans border rounded-button bg-white text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 ${getBorderColor()} ${getFocusRing()} ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${icon && iconPosition === 'right' ? 'pr-10' : ''} ${className}`}
          onFocus={props.onFocus ?? ((e) => setIsFocused(true))}
          onBlur={props.onBlur ?? ((e) => setIsFocused(false))}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-crimson font-sans animate-slide-up">{error}</p>
      )}
    </div>
  );
}