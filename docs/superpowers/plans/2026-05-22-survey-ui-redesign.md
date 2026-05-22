# Survey UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp giao diện khảo sát theo Direction C — bo góc 2xl, câu đã điền xanh lá realtime, cảnh báo đỏ khi nộp còn thiếu, bắt buộc điền hết trước khi chuyển phần.

**Architecture:** Thêm props `submitAttempted` + `missingTeacherIds` xuống SurveyGrid/HomeroomForm; validation chạy ở `questions/page.tsx` khi bấm nút; trạng thái màu sắc tính realtime từ `value === null`. Không đụng DB/API.

**Tech Stack:** Next.js 14, Tailwind CSS, TypeScript, React hooks

---

### Task 1: tailwind.config.ts — Thêm slide animations

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Thêm keyframes slideLeft và slideRight vào `tailwind.config.ts`**

```ts
// tailwind.config.ts — trong extend.keyframes, thêm sau pulseSubtle:
slideLeft: {
  '0%': { opacity: '0', transform: 'translateX(24px)' },
  '100%': { opacity: '1', transform: 'translateX(0)' },
},
slideRight: {
  '0%': { opacity: '0', transform: 'translateX(-24px)' },
  '100%': { opacity: '1', transform: 'translateX(0)' },
},
```

- [ ] **Thêm animation names vào `extend.animation`**

```ts
// Thêm sau 'pulse-subtle':
'slide-left': 'slideLeft 0.25s ease-out',
'slide-right': 'slideRight 0.25s ease-out',
```

- [ ] **Commit**

```bash
git add tailwind.config.ts
git commit -m "feat(ui): add slide-left/right animations to tailwind config"
```

---

### Task 2: ScoreInput.tsx — 3-state styling

**Files:**
- Modify: `components/survey/ScoreInput.tsx`

- [ ] **Ghi đè toàn bộ file với implementation 3 trạng thái**

```tsx
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
      className={`h-8 w-16 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer text-center transition-all duration-300 ${selectClass}`}
    >
      <option value="">-</option>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
```

- [ ] **Commit**

```bash
git add components/survey/ScoreInput.tsx
git commit -m "feat(survey): ScoreInput 3-state styling — default/answered(green)/error(red)"
```

---

### Task 3: YesNoInput.tsx — Error state

**Files:**
- Modify: `components/survey/YesNoInput.tsx`

- [ ] **Ghi đè toàn bộ file, thêm `hasError` prop**

```tsx
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
```

- [ ] **Commit**

```bash
git add components/survey/YesNoInput.tsx
git commit -m "feat(survey): YesNoInput error state — red outline when hasError"
```

---

### Task 4: Navbar + Card — Visual refresh

**Files:**
- Modify: `components/ui/Navbar.tsx`
- Modify: `components/ui/Card.tsx`

- [ ] **Navbar: thêm `shadow-md` vào nav**

Trong `components/ui/Navbar.tsx`, dòng 16, đổi className của `<nav>`:

```tsx
// Trước:
<nav className="bg-primary h-12 flex items-center justify-between px-6 text-white">
// Sau:
<nav className="bg-primary h-12 flex items-center justify-between px-6 text-white shadow-md">
```

- [ ] **Card: đổi `rounded-modal` → `rounded-2xl`, tăng shadow**

Trong `components/ui/Card.tsx`, dòng 21, đổi className của `<div>`:

```tsx
// Trước:
className={`bg-white border border-border rounded-modal shadow-md ${paddingStyles[padding]} ${hoverStyles} ${className}`}
// Sau:
className={`bg-white border border-[#e8f0fb] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] ${paddingStyles[padding]} ${hoverStyles} ${className}`}
```

- [ ] **Commit**

```bash
git add components/ui/Navbar.tsx components/ui/Card.tsx
git commit -m "feat(ui): navbar shadow, Card rounded-2xl with blue-tint border"
```

---

### Task 5: SurveyGrid.tsx — Bubbles + gradient header + slide animation + validation props

**Files:**
- Modify: `components/survey/SurveyGrid.tsx`

- [ ] **Ghi đè toàn bộ file**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Teacher } from '@/lib/types';
import ScoreInput from './ScoreInput';
import YesNoInput from './YesNoInput';

interface SurveyGridProps {
  teachers: Teacher[];
  scores: Record<string, Record<number, number | null>>;
  onScoreChange: (teacherId: string, questionIndex: number, score: number) => void;
  disabledTeachers: string[];
  userClassName?: string;
  grade?: string;
  submitAttempted: boolean;
  missingTeacherIds: string[];
}

export function getDisabledSubjectForClass(className: string): string | null {
  if (!className) return null;
  const match = className.match(/^\d+\s+(.+)$/);
  if (!match) return null;
  const classLabel = match[1].toLowerCase();
  if (classLabel.includes('toán')) return 'toan';
  if (classLabel.includes('lý')) return 'ly';
  if (classLabel.includes('hóa')) return 'hoa';
  if (classLabel.includes('sinh')) return 'sinh';
  if (classLabel.includes('văn')) return 'van';
  if (classLabel.includes('sử')) return 'su';
  if (classLabel.includes('địa')) return 'dia';
  if (classLabel.includes('anh')) return 'anh';
  if (classLabel.includes('tin')) return 'tin';
  return null;
}

const QUESTIONS = [
  'Thái độ thân thiện, gần gũi; quan tâm, hỗ trợ HS; tác phong chuẩn mực',
  'Giảng bài dễ hiểu; phương pháp tích cực, sinh động; sử dụng đồ dùng dạy học tốt',
  'Hình thức kiểm tra đa dạng, công bằng, khách quan',
  'Tạo động lực học tập; tạo cơ hội thảo luận, phản biện, thể hiện ý kiến',
  'Mong muốn thầy/cô dạy tiếp năm học 2026-2027',
];

const LAST_Q = QUESTIONS.length - 1;

export default function SurveyGrid({
  teachers,
  scores,
  onScoreChange,
  disabledTeachers,
  userClassName,
  grade,
  submitAttempted,
  missingTeacherIds,
}: SurveyGridProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const disabledSubject = getDisabledSubjectForClass(userClassName || '');
  const isGrade12 = grade === '12';
  const visibleQuestions = isGrade12 ? QUESTIONS.slice(0, -1) : QUESTIONS;

  const isTeacherDisabled = (teacher: Teacher): boolean => {
    if (disabledTeachers.includes(teacher.id)) return true;
    if (disabledSubject && teacher.subject_code === disabledSubject) return true;
    return false;
  };

  // Auto-navigate mobile to first missing teacher
  useEffect(() => {
    if (missingTeacherIds.length > 0) {
      const idx = teachers.findIndex((t) => missingTeacherIds.includes(t.id));
      if (idx !== -1 && idx !== currentIndex) {
        setDirection(idx > currentIndex ? 'left' : 'right');
        setCurrentIndex(idx);
      }
    }
  }, [missingTeacherIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = () => {
    setDirection('left');
    setCurrentIndex((i) => Math.min(teachers.length - 1, i + 1));
  };

  const goPrev = () => {
    setDirection('right');
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const currentTeacher = teachers[currentIndex];

  const getQState = (teacher: Teacher, qIndex: number) => {
    const disabled = isTeacherDisabled(teacher);
    const val = scores[teacher.id]?.[qIndex] ?? null;
    const isAnswered = val !== null;
    const hasError = submitAttempted && !isAnswered && !disabled;
    return { disabled, val, isAnswered, hasError };
  };

  const bubbleClass = (isAnswered: boolean, hasError: boolean, disabled: boolean) => {
    if (disabled) return 'bg-bg-disabled border-border';
    if (isAnswered) return 'bg-[#f0faf4] border-[1.5px] border-[#28a745]';
    if (hasError) return 'bg-[#fff8f8] border-[1.5px] border-[#dc3545]';
    return 'bg-[#f8fbff] border border-[#dee2e6]';
  };

  return (
    <>
      {/* ===== DESKTOP TABLE (≥1024px) ===== */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left p-3 bg-bg-light border border-border font-medium text-text-primary w-[180px]">
                Tiêu chí
              </th>
              {teachers.map((teacher) => (
                <th
                  key={teacher.id}
                  className={`p-3 bg-bg-light border border-border font-medium text-text-primary text-center min-w-[110px] ${
                    isTeacherDisabled(teacher) ? 'opacity-50' : ''
                  }`}
                >
                  <div className="whitespace-nowrap">{teacher.full_name}</div>
                  <div className="text-xs text-text-muted font-normal mt-1">
                    {teacher.subject || 'Giáo viên'}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleQuestions.map((question, qIndex) => (
              <tr key={qIndex}>
                <td className="p-3 border border-border text-text-primary align-top">
                  <span className="font-medium mr-2">{qIndex + 1}.</span>
                  {question}
                </td>
                {teachers.map((teacher) => {
                  const { disabled, val, isAnswered, hasError } = getQState(teacher, qIndex);
                  return (
                    <td
                      key={teacher.id}
                      className={`p-2 border border-border text-center align-middle transition-colors duration-300 ${
                        disabled ? 'bg-bg-disabled' : isAnswered ? 'bg-[#f0faf4]' : hasError ? 'bg-[#fff8f8]' : ''
                      }`}
                    >
                      {qIndex === LAST_Q ? (
                        <YesNoInput
                          value={val}
                          onChange={(v) => onScoreChange(teacher.id, qIndex, v)}
                          disabled={disabled}
                          hasError={hasError}
                        />
                      ) : (
                        <ScoreInput
                          value={val}
                          onChange={(s) => onScoreChange(teacher.id, qIndex, s)}
                          disabled={disabled}
                          hasError={hasError}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== MOBILE / TABLET CARD VIEW (<1024px) ===== */}
      <div className="block lg:hidden">
        {teachers.length > 0 && (
          <>
            {/* Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-xl bg-white hover:bg-bg-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </button>
              <span className="text-sm text-text-secondary font-medium">
                {currentIndex + 1} / {teachers.length}
              </span>
              <button
                type="button"
                onClick={goNext}
                disabled={currentIndex === teachers.length - 1}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-xl bg-white hover:bg-bg-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Teacher card */}
            {currentTeacher && (
              <div
                key={currentIndex}
                className={`rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#e8f0fb] ${
                  direction === 'left' ? 'animate-slide-left' : 'animate-slide-right'
                } ${isTeacherDisabled(currentTeacher) ? 'opacity-60' : ''}`}
              >
                {/* Gradient header */}
                <div className="bg-gradient-to-br from-primary to-primary-dark px-4 py-4 text-center">
                  <div className="font-bold text-white">{currentTeacher.full_name}</div>
                  <div className="text-xs text-white/75 mt-0.5">{currentTeacher.subject || 'Giáo viên'}</div>
                  {isTeacherDisabled(currentTeacher) && (
                    <div className="text-xs text-yellow-200 mt-1">Không đánh giá (môn chuyên)</div>
                  )}
                </div>

                {/* Question bubbles */}
                <div className="bg-white p-3 space-y-2">
                  {visibleQuestions.map((question, qIndex) => {
                    const { disabled, val, isAnswered, hasError } = getQState(currentTeacher, qIndex);
                    return (
                      <div
                        key={qIndex}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-300 ${bubbleClass(isAnswered, hasError, disabled)}`}
                      >
                        <div className="flex-1 min-w-0">
                          {hasError && (
                            <div className="text-[10px] text-[#dc3545] font-bold mb-0.5">⚠ Chưa điền</div>
                          )}
                          <div className="text-sm text-text-primary">
                            <span className={`font-semibold mr-1 ${isAnswered ? 'text-[#28a745]' : ''}`}>
                              {isAnswered ? '✓' : `${qIndex + 1}.`}
                            </span>
                            {question}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {qIndex === LAST_Q ? (
                            <YesNoInput
                              value={val}
                              onChange={(v) => onScoreChange(currentTeacher.id, qIndex, v)}
                              disabled={disabled}
                              hasError={hasError}
                            />
                          ) : (
                            <ScoreInput
                              value={val}
                              onChange={(s) => onScoreChange(currentTeacher.id, qIndex, s)}
                              disabled={disabled}
                              hasError={hasError}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dot indicators */}
            {teachers.length > 1 && (
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                {teachers.map((teacher, i) => {
                  const isMissing = missingTeacherIds.includes(teacher.id);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setDirection(i > currentIndex ? 'left' : 'right');
                        setCurrentIndex(i);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        i === currentIndex ? 'bg-primary scale-125' : isMissing ? 'bg-[#dc3545]' : 'bg-border'
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
```

- [ ] **Commit**

```bash
git add components/survey/SurveyGrid.tsx
git commit -m "feat(survey): SurveyGrid — bubble layout, gradient header, slide animation, validation states"
```

---

### Task 6: HomeroomForm.tsx — Bubble layout + submitAttempted

**Files:**
- Modify: `components/survey/HomeroomForm.tsx`

- [ ] **Ghi đè toàn bộ file**

```tsx
'use client';

import { Teacher } from '@/lib/types';
import ScoreInput from './ScoreInput';
import YesNoInput from './YesNoInput';

interface HomeroomFormProps {
  teacher: Teacher;
  scores: Record<number, number | null>;
  wantContinue: number | null;
  openFeedback: string;
  onScoreChange: (questionIndex: number, score: number) => void;
  onWantContinueChange: (val: number) => void;
  onFeedbackChange: (feedback: string) => void;
  grade?: string;
  submitAttempted: boolean;
}

const QUESTIONS = [
  'Mức độ quan tâm, hỗ trợ học sinh của GVCN',
  'Khả năng quản lý, tổ chức lớp học hiệu quả',
  'Thái độ và cách cư xử của GVCN đối với học sinh',
  'Sự nhiệt tình và trách nhiệm của GVCN trong các hoạt động của lớp',
];

export default function HomeroomForm({
  teacher,
  scores,
  wantContinue,
  openFeedback,
  onScoreChange,
  onWantContinueChange,
  onFeedbackChange,
  grade,
  submitAttempted,
}: HomeroomFormProps) {
  const isGrade12 = grade === '12';

  const bubbleClass = (isAnswered: boolean, hasError: boolean) => {
    if (isAnswered) return 'bg-[#f0faf4] border-[1.5px] border-[#28a745]';
    if (hasError) return 'bg-[#fff8f8] border-[1.5px] border-[#dc3545]';
    return 'bg-[#f8fbff] border border-[#dee2e6]';
  };

  return (
    <div className="space-y-5">
      {/* Teacher header */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl px-6 py-4 text-center">
        <h3 className="text-base font-bold text-white">{teacher.full_name}</h3>
        <p className="text-sm text-white/75 mt-0.5">Giáo viên chủ nhiệm</p>
      </div>

      {/* Score questions */}
      <div className="space-y-2">
        {QUESTIONS.map((question, qIndex) => {
          const val = scores[qIndex] ?? null;
          const isAnswered = val !== null;
          const hasError = submitAttempted && !isAnswered;
          return (
            <div
              key={qIndex}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${bubbleClass(isAnswered, hasError)}`}
            >
              <div className="flex-1 min-w-0">
                {hasError && (
                  <div className="text-[10px] text-[#dc3545] font-bold mb-0.5">⚠ Chưa điền</div>
                )}
                <div className="text-sm text-text-primary">
                  <span className={`font-semibold mr-1 ${isAnswered ? 'text-[#28a745]' : ''}`}>
                    {isAnswered ? '✓' : `${qIndex + 1}.`}
                  </span>
                  {question}
                </div>
              </div>
              <div className="flex-shrink-0">
                <ScoreInput
                  value={val}
                  onChange={(score) => onScoreChange(qIndex, score)}
                  hasError={hasError}
                />
              </div>
            </div>
          );
        })}

        {/* want_continue — chỉ hiện với lớp không phải 12 */}
        {!isGrade12 && (() => {
          const isAnswered = wantContinue !== null;
          const hasError = submitAttempted && !isAnswered;
          return (
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${bubbleClass(isAnswered, hasError)}`}
            >
              <div className="flex-1 min-w-0">
                {hasError && (
                  <div className="text-[10px] text-[#dc3545] font-bold mb-0.5">⚠ Chưa điền</div>
                )}
                <div className="text-sm text-text-primary">
                  <span className={`font-semibold mr-1 ${isAnswered ? 'text-[#28a745]' : ''}`}>
                    {isAnswered ? '✓' : `${QUESTIONS.length + 1}.`}
                  </span>
                  Mong muốn thầy/cô tiếp tục chủ nhiệm lớp năm học sau không?
                </div>
              </div>
              <div className="flex-shrink-0">
                <YesNoInput
                  value={wantContinue}
                  onChange={onWantContinueChange}
                  hasError={hasError}
                />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Open feedback */}
      <div className="space-y-2">
        <label htmlFor="open-feedback" className="block text-sm font-medium text-text-primary">
          Ý kiến đóng góp thêm <span className="text-text-muted font-normal">(không bắt buộc)</span>
        </label>
        <textarea
          id="open-feedback"
          value={openFeedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="Nhập ý kiến của bạn về giáo viên chủ nhiệm..."
          rows={4}
          className="w-full px-4 py-3 text-sm border border-[#dee2e6] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-colors"
        />
      </div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add components/survey/HomeroomForm.tsx
git commit -m "feat(survey): HomeroomForm bubble layout, gradient header, validation states"
```

---

### Task 7: questions/page.tsx — Validation + progress counter + submitAttempted

**Files:**
- Modify: `app/(student)/survey/questions/page.tsx`

- [ ] **Thêm state mới sau `homeroomWantContinue`**

```tsx
// Sau dòng: const [openFeedback, setOpenFeedback] = useState('');
const [submitAttempted, setSubmitAttempted] = useState(false);
const [missingTeacherIds, setMissingTeacherIds] = useState<string[]>([]);
```

- [ ] **Thêm import `getDisabledSubjectForClass` (đã export từ SurveyGrid)**

```tsx
// Dòng import SurveyGrid đổi thành:
import SurveyGrid, { getDisabledSubjectForClass } from '@/components/survey/SurveyGrid';
```

- [ ] **Thay `calculateProgress` bằng version mới trả về `{ answered, total, percent }`**

Xóa hàm `calculateProgress` hiện tại và `const progress = calculateProgress()`, thay bằng:

```tsx
const calculateProgress = useCallback(() => {
  const isGrade12 = user?.grade === '12';
  const disabledSubject = getDisabledSubjectForClass(user?.class_name || '');
  const activeTeachers = subjectTeachers.filter(
    (t) => !(disabledSubject && t.subject_code === disabledSubject)
  );
  const questionsPerTeacher = isGrade12 ? 4 : 5;
  const homeroomTotal = isGrade12 ? 4 : 5;
  const total = activeTeachers.length * questionsPerTeacher + homeroomTotal;

  let answered = 0;
  activeTeachers.forEach((teacher) => {
    const ts = subjectScores[teacher.id] || {};
    for (let i = 0; i < questionsPerTeacher; i++) {
      if (ts[i] !== null && ts[i] !== undefined) answered++;
    }
  });
  for (let i = 0; i < 4; i++) {
    if (homeroomScores[i] !== null && homeroomScores[i] !== undefined) answered++;
  }
  if (!isGrade12 && homeroomWantContinue !== null) answered++;

  return { answered, total, percent: total > 0 ? Math.round((answered / total) * 100) : 0 };
}, [subjectScores, homeroomScores, homeroomWantContinue, subjectTeachers, user]);

const { answered: answeredCount, total: totalCount, percent: progress } = calculateProgress();
```

- [ ] **Thêm hàm `getMissingSubjectTeachers` sau `handleHomeroomScoreChange`**

```tsx
const getMissingSubjectTeachers = useCallback((): string[] => {
  const disabledSubject = getDisabledSubjectForClass(user?.class_name || '');
  const isGrade12 = user?.grade === '12';
  const questionsCount = isGrade12 ? 4 : 5;
  return subjectTeachers
    .filter((teacher) => {
      if (disabledSubject && teacher.subject_code === disabledSubject) return false;
      const ts = subjectScores[teacher.id] || {};
      for (let i = 0; i < questionsCount; i++) {
        if (ts[i] === null || ts[i] === undefined) return true;
      }
      return false;
    })
    .map((t) => t.id);
}, [subjectTeachers, subjectScores, user]);

const getMissingHomeroomQuestions = useCallback((): number[] => {
  const isGrade12 = user?.grade === '12';
  const missing: number[] = [];
  for (let i = 0; i < 4; i++) {
    if (homeroomScores[i] === null || homeroomScores[i] === undefined) missing.push(i);
  }
  if (!isGrade12 && homeroomWantContinue === null) missing.push(4);
  return missing;
}, [homeroomScores, homeroomWantContinue, user]);
```

- [ ] **Thêm handler `handleContinueToHomeroom` thay thế `() => setCurrentPart('homeroom')`**

```tsx
const handleContinueToHomeroom = () => {
  setSubmitAttempted(true);
  const missing = getMissingSubjectTeachers();
  setMissingTeacherIds(missing);
  if (missing.length > 0) {
    setError('Vui lòng điền đầy đủ tất cả câu hỏi của mỗi giáo viên trước khi tiếp tục');
    return;
  }
  setError(null);
  setSubmitAttempted(false);
  setMissingTeacherIds([]);
  setCurrentPart('homeroom');
};
```

- [ ] **Cập nhật đầu `handleSubmit` — thêm homeroom validation trước khi submit**

Thay đoạn validation cũ (từ `// Validate: require at least one scored...` đến `setSubmitting(true)`) bằng:

```tsx
setSubmitAttempted(true);
const missingHomeroom = getMissingHomeroomQuestions();
if (missingHomeroom.length > 0) {
  setError('Vui lòng điền đầy đủ tất cả câu hỏi trước khi nộp');
  return;
}
setSubmitting(true);
setError(null);
```

- [ ] **Cập nhật Progress Bar UI trong JSX** — tìm khối sticky progress bar và thay bằng:

```tsx
{/* Sticky Progress Bar */}
<div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#e8f0fb] sticky top-4 z-10">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-text-secondary font-medium">
      {currentPart === 'subject' ? 'Phần I: Đánh giá giáo viên bộ môn' : 'Phần II: Đánh giá giáo viên chủ nhiệm'}
    </span>
    <span className="text-sm font-bold text-primary">{progress}%</span>
  </div>
  <div className="h-2.5 bg-bg-disabled rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-blue-400 to-primary rounded-full transition-all duration-500"
      style={{ width: `${progress}%` }}
    />
  </div>
  <div className="text-right mt-1.5">
    <span className="text-xs text-text-muted">{answeredCount} / {totalCount} câu đã điền</span>
  </div>
</div>
```

- [ ] **Cập nhật error banner UI** — tìm `{error && (` và thay bằng:

```tsx
{error && (
  <div className="flex items-center gap-3 bg-[#fff5f5] border border-[#dc3545] rounded-2xl p-4 animate-slide-up">
    <AlertCircle className="w-5 h-5 text-[#dc3545] flex-shrink-0" />
    <p className="text-[#dc3545] text-sm font-medium">{error}</p>
  </div>
)}
```

- [ ] **Cập nhật nút "Tiếp tục Phần II"** — tìm `<Button onClick={() => setCurrentPart('homeroom')}>` và đổi thành:

```tsx
<Button onClick={handleContinueToHomeroom}>
  Tiếp tục Phần II
</Button>
```

- [ ] **Truyền props mới xuống SurveyGrid**

Tìm `<SurveyGrid` và thêm 2 props:

```tsx
<SurveyGrid
  teachers={subjectTeachers}
  scores={subjectScores}
  onScoreChange={handleSubjectScoreChange}
  disabledTeachers={[]}
  userClassName={user?.class_name}
  grade={user?.grade}
  submitAttempted={submitAttempted}
  missingTeacherIds={missingTeacherIds}
/>
```

- [ ] **Truyền `submitAttempted` xuống HomeroomForm**

Tìm `<HomeroomForm` và thêm prop:

```tsx
<HomeroomForm
  teacher={homeroomTeacher}
  scores={homeroomScores}
  wantContinue={homeroomWantContinue}
  openFeedback={openFeedback}
  onScoreChange={handleHomeroomScoreChange}
  onWantContinueChange={setHomeroomWantContinue}
  onFeedbackChange={setOpenFeedback}
  grade={user?.grade}
  submitAttempted={submitAttempted}
/>
```

- [ ] **Commit**

```bash
git add "app/(student)/survey/questions/page.tsx"
git commit -m "feat(survey): mandatory validation, green/red states, progress counter with answered/total"
```

---

### Task 8: Push & verify

- [ ] **Push lên remote**

```bash
git push origin main
```

- [ ] **Kiểm tra thủ công trên browser — desktop**
  - Điền 1 câu → ô chuyển xanh lá ngay lập tức
  - Bấm "Tiếp tục Phần II" khi còn thiếu → banner đỏ, các ô thiếu đỏ, không chuyển
  - Điền hết → bấm tiếp tục thành công, chuyển sang Phần II
  - Phần II: bấm "Nộp" khi còn thiếu → ô đỏ, không nộp
  - Điền hết GVCN → nộp thành công
  - Progress bar gradient + hiển thị "X / Y câu đã điền"

- [ ] **Kiểm tra thủ công trên mobile** (hoặc DevTools responsive mode)
  - Mỗi giáo viên hiển thị 1 card với gradient header
  - Chuyển giáo viên có slide animation
  - Câu điền xong → bubble xanh lá + icon ✓
  - Khi validation fail → dot đỏ cho GV thiếu, auto-scroll đến GV đầu tiên thiếu
  - Câu hỏi cuối (Có/Không) hiển thị 2 nút đúng trạng thái
