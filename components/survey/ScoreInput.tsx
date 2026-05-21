'use client';

import { useState, useRef, useEffect } from 'react';

interface ScoreInputProps {
  value: number | null;
  onChange: (score: number) => void;
  disabled?: boolean;
}

export default function ScoreInput({ value, onChange, disabled = false }: ScoreInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (disabled) {
    return (
      <div className="w-10 h-7 flex items-center justify-center text-sm text-text-muted bg-bg-disabled rounded-[2px]">
        Không học
      </div>
    );
  }

  const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-10 h-7 flex items-center justify-center text-sm font-medium border border-border rounded-[2px] bg-white hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
      >
        {value !== null ? value : '-'}
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white border border-border rounded-[2px] shadow-lg">
          <div className="grid grid-cols-5 gap-1 p-2">
            {scores.map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => {
                  onChange(score);
                  setIsOpen(false);
                }}
                className={`w-8 h-8 flex items-center justify-center text-sm rounded-[2px] transition-colors ${
                  value === score
                    ? 'bg-primary text-white'
                    : 'bg-white text-text-primary hover:bg-bg-light border border-border'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}