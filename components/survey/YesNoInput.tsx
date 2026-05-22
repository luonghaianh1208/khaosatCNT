'use client';

interface YesNoInputProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export default function YesNoInput({ value, onChange, disabled = false, hasError = false }: YesNoInputProps) {
  if (disabled) {
    return (
      <div className="inline-flex items-center justify-center text-xs text-text-muted bg-bg-disabled rounded-xl px-2 py-1">
        N/A
      </div>
    );
  }

  const btnBase = 'px-3 py-1 text-xs rounded-xl border transition-all duration-300 font-medium';

  return (
    <div className="flex gap-1 justify-center">
      <button
        type="button"
        onClick={() => onChange(1)}
        className={`${btnBase} ${
          value === 1
            ? 'bg-success text-white border-success shadow-sm'
            : hasError
            ? 'bg-white text-[#dc3545] border-[#dc3545]'
            : 'bg-white text-text-primary border-[#dee2e6] hover:bg-bg-light'
        }`}
      >
        Có
      </button>
      <button
        type="button"
        onClick={() => onChange(0)}
        className={`${btnBase} ${
          value === 0
            ? 'bg-crimson text-white border-crimson shadow-sm'
            : hasError
            ? 'bg-white text-[#dc3545] border-[#dc3545]'
            : 'bg-white text-text-primary border-[#dee2e6] hover:bg-bg-light'
        }`}
      >
        Không
      </button>
    </div>
  );
}
