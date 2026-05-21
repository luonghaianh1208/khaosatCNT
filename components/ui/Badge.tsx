import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'secondary' | 'primary';
  children: React.ReactNode;
}

export default function Badge({ variant = 'secondary', children }: BadgeProps) {
  const variants = {
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-crimson/10 text-crimson',
    secondary: 'bg-bgLight text-textSecondary',
    primary: 'bg-primary/10 text-primary',
  };

  return (
    <span className={`inline-block px-2 py-1 text-12 rounded ${variants[variant]}`}>
      {children}
    </span>
  );
}