'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ScoreInputProps {
  value: number | null;
  onChange: (score: number) => void;
  disabled?: boolean;
}

export default function ScoreInput({ value, onChange, disabled = false }: ScoreInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => setIsOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  if (disabled) {
    return (
      <div className="w-10 h-7 flex items-center justify-center text-xs text-text-muted bg-bg-disabled rounded-[2px]">
        N/A
      </div>
    );
  }

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    }
    setIsOpen((prev) => !prev);
  };

  const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const dropdown = (
    <div
      ref={dropdownRef}
      className="bg-white border border-border rounded-[2px] shadow-lg"
      style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999 }}
    >
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
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className="w-10 h-7 flex items-center justify-center text-sm font-medium border border-border rounded-[2px] bg-white hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
      >
        {value !== null ? value : '-'}
      </button>
      {mounted && isOpen && createPortal(dropdown, document.body)}
    </>
  );
}
