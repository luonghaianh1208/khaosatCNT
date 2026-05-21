'use client';

import { Teacher } from '@/lib/types';
import ScoreInput from './ScoreInput';

interface SurveyGridProps {
  teachers: Teacher[];
  scores: Record<string, Record<number, number | null>>; // { teacherId: { questionIndex: score } }
  onScoreChange: (teacherId: string, questionIndex: number, score: number) => void;
  disabledTeachers: string[];
  userClassName?: string;
}

// Get disabled subject based on class name
export function getDisabledSubjectForClass(className: string): string | null {
  if (!className) return null;

  // Format: "10 Toán", "10 Lý", "11 Toán", "12 Văn", etc.
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

export default function SurveyGrid({
  teachers,
  scores,
  onScoreChange,
  disabledTeachers,
  userClassName,
}: SurveyGridProps) {
  const disabledSubject = getDisabledSubjectForClass(userClassName || '');

  // Determine which teachers should be disabled (teacher's subject matches student's specialized subject)
  const isTeacherDisabled = (teacher: Teacher): boolean => {
    if (disabledTeachers.includes(teacher.id)) return true;
    if (disabledSubject && teacher.subject_code === disabledSubject) return true;
    return false;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-left p-3 bg-bg-light border border-border font-medium text-text-primary min-w-[250px]">
              Tiêu chí
            </th>
            {teachers.map((teacher) => (
              <th
                key={teacher.id}
                className={`p-3 bg-bg-light border border-border font-medium text-text-primary text-center min-w-[100px] ${
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
                    className={`p-3 border border-border text-center align-top ${
                      disabled ? 'bg-bg-disabled' : ''
                    }`}
                  >
                    <ScoreInput
                      value={scores[teacher.id]?.[qIndex] ?? null}
                      onChange={(score) => onScoreChange(teacher.id, qIndex, score)}
                      disabled={disabled}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}