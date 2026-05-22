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

        {/* want_continue — only for non-grade-12 */}
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