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
    // Chỉ disable GV bộ môn trùng môn chuyên của lớp — GV chuyên vẫn đánh giá bình thường
    if (disabledSubject && teacher.subject_code === disabledSubject && teacher.teacher_type === 'bo_mon') return true;
    return false;
  };

  useEffect(() => {
    if (missingTeacherIds.length > 0) {
      const idx = teachers.findIndex((t) => missingTeacherIds.includes(t.id));
      if (idx !== -1 && idx !== currentIndex) {
        setDirection(idx > currentIndex ? 'left' : 'right');
        setCurrentIndex(idx);
      }
    }
  }, [missingTeacherIds, teachers]); // eslint-disable-line react-hooks/exhaustive-deps

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
      {/* ===== DESKTOP TABLE (>=1024px) ===== */}
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

            {currentTeacher && (
              <div
                key={currentIndex}
                className={`rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#e8f0fb] ${
                  direction === 'left' ? 'animate-slide-left' : 'animate-slide-right'
                } ${isTeacherDisabled(currentTeacher) ? 'opacity-60' : ''}`}
              >
                <div className="bg-gradient-to-br from-primary to-primary-dark px-4 py-4 text-center">
                  <div className="font-bold text-white">{currentTeacher.full_name}</div>
                  <div className="text-xs text-white/75 mt-0.5">{currentTeacher.subject || 'Giáo viên'}</div>
                  {isTeacherDisabled(currentTeacher) && (
                    <div className="text-xs text-yellow-200 mt-1">Không đánh giá (môn chuyên)</div>
                  )}
                </div>

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
