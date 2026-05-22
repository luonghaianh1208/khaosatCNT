import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success';
  className?: string;
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const variantStyles = {
  primary: 'bg-primary',
  success: 'bg-success',
};

export default function ProgressBar({
  value,
  label,
  showLabel = true,
  size = 'md',
  variant = 'primary',
  className = '',
}: ProgressBarProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && label && <div className="text-sm text-text-secondary">{label}</div>}
      <div className={`w-full bg-border rounded-full ${sizeStyles[size]}`}>
        <div
          className={`${variantStyles[variant]} ${sizeStyles[size]} rounded-full transition-all`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}