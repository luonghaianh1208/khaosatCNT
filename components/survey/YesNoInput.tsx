'use client';

interface YesNoInputProps {
  value: number | null; // 1 = Có, 0 = Không, null = chưa chọn
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function YesNoInput({ value, onChange, disabled = false }: YesNoInputProps) {
  if (disabled) {
    return (
      <div className="inline-flex items-center justify-center text-xs text-text-muted bg-bg-disabled rounded-[2px] px-2 py-1">
        N/A
      </div>
    );
  }

  return (
    <div className="flex gap-1 justify-center">
      <button
        type="button"
        onClick={() => onChange(1)}
        className={`px-3 py-1 text-xs rounded-[2px] border transition-colors font-medium ${
          value === 1
            ? 'bg-success text-white border-success'
            : 'bg-white text-text-primary border-border hover:bg-bg-light'
        }`}
      >
        Có
      </button>
      <button
        type="button"
        onClick={() => onChange(0)}
        className={`px-3 py-1 text-xs rounded-[2px] border transition-colors font-medium ${
          value === 0
            ? 'bg-crimson text-white border-crimson'
            : 'bg-white text-text-primary border-border hover:bg-bg-light'
        }`}
      >
        Không
      </button>
    </div>
  );
}
