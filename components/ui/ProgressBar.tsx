import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
}

export default function ProgressBar({ value, label }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      {label && <div className="text-14 text-textSecondary">{label}</div>}
      <div className="w-full bg-border rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}