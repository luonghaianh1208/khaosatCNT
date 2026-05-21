import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'w-full px-4 py-2 font-sans text-sm font-normal rounded-button transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary disabled:bg-primary disabled:opacity-50',
    secondary: 'bg-secondary-nav text-white hover:bg-secondary-nav/90 focus:ring-secondary-nav disabled:bg-bg-disabled disabled:opacity-50',
    danger: 'bg-crimson text-white hover:bg-crimson-dark focus:ring-crimson disabled:bg-bg-disabled disabled:opacity-50',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}