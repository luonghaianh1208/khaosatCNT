import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export default function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`bg-white border border-border rounded-modal shadow-md p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}