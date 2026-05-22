import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'secondary' | 'primary';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export default function Badge({ variant = 'secondary', size = 'md', children }: BadgeProps) {
  const variants = {
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-crimson/10 text-crimson',
    secondary: 'bg-bg-light text-text-secondary',
    primary: 'bg-primary/10 text-primary',
  };

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs font-medium',
  };

  return (
    <span className={`inline-block rounded ${variants[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
}
