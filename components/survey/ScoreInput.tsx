'use client';

interface ScoreInputProps {
  value: number | null;
  onChange: (score: number) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export default function ScoreInput({ value, onChange, disabled = false, hasError = false }: ScoreInputProps) {
  if (disabled) {
    return (
      <div className="inline-flex items-center justify-center text-xs text-text-muted bg-bg-disabled rounded-xl px-2 h-8">
        N/A
      </div>
    );
  }

  const isAnswered = value !== null;

  const selectClass = isAnswered
    ? 'border-[1.5px] border-[#28a745] text-[#28a745] font-bold bg-[#f0faf4]'
    : hasError
    ? 'border-[1.5px] border-[#dc3545] text-[#dc3545] bg-[#fff8f8]'
    : 'border border-[#dee2e6] text-text-secondary bg-white';

  return (
    <select
      value={value ?? ''}
      onChange={(e) => {
        const val = e.target.value;
        if (val !== '') onChange(Number(val));
      }}
      className={`h-8 w-12 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer text-center appearance-none [text-align-last:center] transition-all duration-300 ${selectClass}`}
    >
      <option value="">-</option>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
