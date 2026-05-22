'use client';

interface ScoreInputProps {
  value: number | null;
  onChange: (score: number) => void;
  disabled?: boolean;
}

export default function ScoreInput({ value, onChange, disabled = false }: ScoreInputProps) {
  if (disabled) {
    return (
      <div className="inline-flex items-center justify-center text-xs text-text-muted bg-bg-disabled rounded-[2px] px-2 h-8">
        N/A
      </div>
    );
  }

  return (
    <select
      value={value ?? ''}
      onChange={(e) => {
        const val = e.target.value;
        if (val !== '') onChange(Number(val));
      }}
      className="h-8 w-16 text-sm border border-border rounded-[2px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer text-center"
    >
      <option value="">-</option>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
