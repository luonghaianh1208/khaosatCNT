import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({ className = '', children, hoverable = false, padding = 'md', ...props }: CardProps) {
  const hoverStyles = hoverable ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : '';

  return (
    <div
      className={`bg-white border border-border rounded-modal shadow-md ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}