'use client';

import { useState } from 'react';
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
}: SurveyGridProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const disabledSubject = getDisabledSubjectForClass(userClassName || '');

  const isTeacherDisabled = (teacher: Teacher): boolean => {
    if (disabledTeachers.includes(teacher.id)) return true;
    if (disabledSubject && teacher.subject_code === disabledSubject) return true;
    return false;
  };

  const currentTeacher = teachers[currentIndex];

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
            {QUESTIONS.map((question, qIndex) => (
              <tr key={qIndex}>
                <td className="p-3 border border-border text-text-primary align-top">
                  <span className="font-medium mr-2">{qIndex + 1}.</span>
                  {question}
                </td>
                {teachers.map((teacher) => {
                  const disabled = isTeacherDisabled(teacher);
                  return (
                    <td
                      key={teacher.id}
                      className={`p-3 border border-border text-center align-middle ${
                        disabled ? 'bg-bg-disabled' : ''
                      }`}
                    >
                      {qIndex === LAST_Q ? (
                        <YesNoInput
                          value={scores[teacher.id]?.[qIndex] ?? null}
                          onChange={(val) => onScoreChange(teacher.id, qIndex, val)}
                          disabled={disabled}
                        />
                      ) : (
                        <ScoreInput
                          value={scores[teacher.id]?.[qIndex] ?? null}
                          onChange={(score) => onScoreChange(teacher.id, qIndex, score)}
                          disabled={disabled}
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
        {teachers.length === 0 ? null : (
          <>
            {/* Navigation header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-[2px] bg-white hover:bg-bg-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </button>

              <span className="text-sm text-text-secondary font-medium">
                Giáo viên {currentIndex + 1} / {teachers.length}
              </span>

              <button
                type="button"
                onClick={() => setCurrentIndex((i) => Math.min(teachers.length - 1, i + 1))}
                disabled={currentIndex === teachers.length - 1}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-[2px] bg-white hover:bg-bg-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Teacher card */}
            {currentTeacher && (
              <div className={`border border-border rounded-modal overflow-hidden ${isTeacherDisabled(currentTeacher) ? 'opacity-60' : ''}`}>
                {/* Teacher header */}
                <div className="bg-primary px-4 py-3 text-center">
                  <div className="font-medium text-white text-sm">{currentTeacher.full_name}</div>
                  <div className="text-xs text-white/80 mt-0.5">{currentTeacher.subject || 'Giáo viên'}</div>
                  {isTeacherDisabled(currentTeacher) && (
                    <div className="text-xs text-yellow-200 mt-1">Không đánh giá (môn chuyên)</div>
                  )}
                </div>

                {/* Questions list */}
                <div className="divide-y divide-border">
                  {QUESTIONS.map((question, qIndex) => (
                    <div
                      key={qIndex}
                      className={`px-4 py-3 flex items-center gap-3 ${
                        isTeacherDisabled(currentTeacher) ? 'bg-bg-disabled' : 'bg-white'
                      }`}
                    >
                      <div className="text-sm text-text-primary flex-1 min-w-0">
                        <span className="font-medium mr-1">{qIndex + 1}.</span>
                        {question}
                      </div>
                      <div className="flex-shrink-0">
                        {qIndex === LAST_Q ? (
                          <YesNoInput
                            value={scores[currentTeacher.id]?.[qIndex] ?? null}
                            onChange={(val) => onScoreChange(currentTeacher.id, qIndex, val)}
                            disabled={isTeacherDisabled(currentTeacher)}
                          />
                        ) : (
                          <ScoreInput
                            value={scores[currentTeacher.id]?.[qIndex] ?? null}
                            onChange={(score) => onScoreChange(currentTeacher.id, qIndex, score)}
                            disabled={isTeacherDisabled(currentTeacher)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dot indicators */}
            {teachers.length > 1 && (
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                {teachers.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentIndex ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
