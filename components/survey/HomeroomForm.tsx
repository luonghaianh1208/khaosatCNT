'use client';

import { Teacher } from '@/lib/types';
import ScoreInput from './ScoreInput';

interface HomeroomFormProps {
  teacher: Teacher;
  scores: Record<number, number | null>; // { questionIndex: score }
  openFeedback: string;
  onScoreChange: (questionIndex: number, score: number) => void;
  onFeedbackChange: (feedback: string) => void;
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
  openFeedback,
  onScoreChange,
  onFeedbackChange,
}: HomeroomFormProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-text-primary">{teacher.full_name}</h3>
        <p className="text-sm text-text-muted">Giáo viên chủ nhiệm</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left p-3 bg-bg-light border border-border font-medium text-text-primary">
                Tiêu chí
              </th>
              <th className="p-3 bg-bg-light border border-border font-medium text-text-primary text-center w-[100px]">
                Điểm
              </th>
            </tr>
          </thead>
          <tbody>
            {QUESTIONS.map((question, qIndex) => (
              <tr key={qIndex}>
                <td className="p-3 border border-border text-text-primary">
                  <span className="font-medium mr-2">{qIndex + 1}.</span>
                  {question}
                </td>
                <td className="p-3 border border-border text-center">
                  <div className="flex justify-center">
                    <ScoreInput
                      value={scores[qIndex] ?? null}
                      onChange={(score) => onScoreChange(qIndex, score)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <label htmlFor="open-feedback" className="block text-sm font-medium text-text-primary">
          Ý kiến đóng góp thêm (không bắt buộc)
        </label>
        <textarea
          id="open-feedback"
          value={openFeedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="Nhập ý kiến của bạn về giáo viên chủ nhiệm..."
          rows={4}
          className="w-full px-3 py-2 text-sm border border-border rounded-[2px] bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
        />
      </div>
    </div>
  );
}