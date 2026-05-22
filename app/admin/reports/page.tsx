'use client';

import { useEffect, useState } from 'react';
import { getReportData } from '@/app/admin/actions';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface TeacherStats {
  teacher_id: string;
  teacher_name: string;
  subject: string;
  class_name: string;
  q1_avg: number;
  q2_avg: number;
  q3_avg: number;
  q4_avg: number;
  q5_avg: number;
  total_avg: number;
  student_count: number;
}

interface StudentInfo {
  user_id: string;
  student_name: string;
  class_name: string;
  submitted_at: string | null;
}

interface OpenFeedback {
  open_feedback: string | null;
  teacher_name: string;
  class_name: string;
}

export default function ReportsPage() {
  const [teacherStats, setTeacherStats] = useState<TeacherStats[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [openFeedbacks, setOpenFeedbacks] = useState<OpenFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    let responses: any[] = [], homeroomResponses: any[] = [], completions: any[] = [];
    try {
      const data = await getReportData();
      responses = data.responses;
      homeroomResponses = data.homeroomResponses;
      completions = data.completions;
    } catch {
      setLoading(false);
      return;
    }

    // Process teacher stats from survey_responses
    const teacherMap = new Map<string, TeacherStats>();

    responses?.forEach((r: any) => {
      const key = `${r.teacher_id}-${r.teacher_class_assignments?.class_name || 'unknown'}`;
      if (!teacherMap.has(key)) {
        teacherMap.set(key, {
          teacher_id: r.teacher_id,
          teacher_name: r.teachers?.full_name || 'Unknown',
          subject: r.teachers?.subject || 'N/A',
          class_name: r.teacher_class_assignments?.class_name || 'N/A',
          q1_avg: 0,
          q2_avg: 0,
          q3_avg: 0,
          q4_avg: 0,
          q5_avg: 0,
          total_avg: 0,
          student_count: 0,
        });
      }
      const stats = teacherMap.get(key)!;
      stats.q1_avg += r.q1_score || 0;
      stats.q2_avg += r.q2_score || 0;
      stats.q3_avg += r.q3_score || 0;
      stats.q4_avg += r.q4_score || 0;
      stats.q5_avg += r.q5_score || 0;
      stats.student_count += 1;
    });

    // Process homeroom responses (questions 1-4)
    homeroomResponses?.forEach((r: any) => {
      const key = `${r.teacher_id}-${r.teacher_class_assignments?.class_name || 'unknown'}`;
      if (!teacherMap.has(key)) {
        teacherMap.set(key, {
          teacher_id: r.teacher_id,
          teacher_name: r.teachers?.full_name || 'Unknown',
          subject: r.teachers?.subject || 'GVCN',
          class_name: r.teacher_class_assignments?.class_name || 'N/A',
          q1_avg: 0,
          q2_avg: 0,
          q3_avg: 0,
          q4_avg: 0,
          q5_avg: 0,
          total_avg: 0,
          student_count: 0,
        });
      }
      const stats = teacherMap.get(key)!;
      stats.q1_avg += r.q1_score || 0;
      stats.q2_avg += r.q2_score || 0;
      stats.q3_avg += r.q3_score || 0;
      stats.q4_avg += r.q4_score || 0;
      stats.student_count += 1;
    });

    // Calculate averages
    teacherMap.forEach((stats) => {
      if (stats.student_count > 0) {
        stats.q1_avg = Math.round((stats.q1_avg / stats.student_count) * 100) / 100;
        stats.q2_avg = Math.round((stats.q2_avg / stats.student_count) * 100) / 100;
        stats.q3_avg = Math.round((stats.q3_avg / stats.student_count) * 100) / 100;
        stats.q4_avg = Math.round((stats.q4_avg / stats.student_count) * 100) / 100;
        stats.q5_avg = Math.round((stats.q5_avg / stats.student_count) * 100) / 100;
        stats.total_avg = Math.round(((stats.q1_avg + stats.q2_avg + stats.q3_avg + stats.q4_avg + stats.q5_avg) / 5) * 100) / 100;
      }
    });

    setTeacherStats(Array.from(teacherMap.values()));

    // Process students
    const studentList: StudentInfo[] = [];
    completions?.forEach((c: any) => {
      studentList.push({
        user_id: c.user_id,
        student_name: c.users?.full_name || 'Unknown',
        class_name: c.users?.class_name || 'N/A',
        submitted_at: c.completed_at,
      });
    });
    setStudents(studentList);

    // Process open feedbacks
    const feedbacks: OpenFeedback[] = [];
    homeroomResponses?.forEach((r: any) => {
      if (r.open_feedback) {
        feedbacks.push({
          open_feedback: r.open_feedback,
          teacher_name: r.teachers?.full_name || 'Unknown',
          class_name: r.teacher_class_assignments?.class_name || 'N/A',
        });
      }
    });
    setOpenFeedbacks(feedbacks);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import('xlsx');

      const wb = XLSX.utils.book_new();

      // Sheet 1: Tong hop
      const tongHopHeaders = ['Giáo viên', 'Môn', 'Lớp', 'TB Câu 1', 'TB Câu 2', 'TB Câu 3', 'TB Câu 4', 'TB Câu 5', 'TB Chung', 'Số HS'];
      const tongHopRows = teacherStats.map(t => [
        t.teacher_name,
        t.subject,
        t.class_name,
        t.q1_avg,
        t.q2_avg,
        t.q3_avg,
        t.q4_avg,
        t.q5_avg,
        t.total_avg,
        t.student_count,
      ]);
      const ws1 = XLSX.utils.aoa_to_sheet([['BÁO CÁO TỔNG HỢP ĐIỂM GIÁO VIÊN'], tongHopHeaders, ...tongHopRows]);
      ws1['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 8 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'Tong hop');

      // Sheet 2: Chi tiet GV
      const chiTietHeaders = ['Giáo viên', 'Môn', 'Lớp', 'TB Câu 1', 'TB Câu 2', 'TB Câu 3', 'TB Câu 4', 'TB Câu 5', 'TB Chung', 'Số HS'];
      const chiTietRows = teacherStats.map(t => [
        t.teacher_name,
        t.subject,
        t.class_name,
        t.q1_avg.toFixed(2),
        t.q2_avg.toFixed(2),
        t.q3_avg.toFixed(2),
        t.q4_avg.toFixed(2),
        t.q5_avg.toFixed(2),
        t.total_avg.toFixed(2),
        t.student_count,
      ]);
      const ws2 = XLSX.utils.aoa_to_sheet([['BÁO CÁO CHI TIẾT THEO GIÁO VIÊN'], chiTietHeaders, ...chiTietRows]);
      ws2['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 8 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Chi tiet GV');

      // Sheet 3: HS tham gia
      const hsHeaders = ['STT', 'Họ tên', 'Lớp', 'Ngày nộp'];
      const hsRows = students.map((s, idx) => [
        idx + 1,
        s.student_name,
        s.class_name,
        s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('vi-VN') : 'N/A',
      ]);
      const ws3 = XLSX.utils.aoa_to_sheet([['DANH SÁCH HỌC SINH THAM GIA KHẢO SÁT'], hsHeaders, ...hsRows]);
      ws3['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'HS tham gia');

      // Sheet 4: Cau hoi mo
      const moHeaders = ['Giáo viên', 'Lớp', 'Phản hồi'];
      const moRows = openFeedbacks.map(f => [f.teacher_name, f.class_name, f.open_feedback]);
      const ws4 = XLSX.utils.aoa_to_sheet([['CÂU HỎI MỞ - GVCN (ẨN DANH)'], moHeaders, ...moRows]);
      ws4['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 60 }];
      XLSX.utils.book_append_sheet(wb, ws4, 'Cau hoi mo');

      XLSX.writeFile(wb, 'bao-cao-khao-sat.xlsx');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Xuất file thất bại');
    }
    setExporting(false);
  };

  const formatScore = (score: number) => {
    return score > 0 ? score.toFixed(2) : '-';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-text-primary">Báo cáo & Thống kê</h1>
        <Button
          variant="primary"
          className="w-auto"
          onClick={exportToExcel}
          disabled={exporting || loading}
        >
          {exporting ? 'Đang xuất...' : 'Export Excel'}
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8 text-text-secondary">Đang tải...</div>
        ) : teacherStats.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <div className="mb-2">Chưa có dữ liệu khảo sát</div>
            <p className="text-sm">Vui lòng kiểm tra đợt khảo sát đang hoạt động</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-light">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-text-secondary">Giáo viên</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-text-secondary">Môn</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-text-secondary">Lớp</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-text-secondary">TB Câu 1</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-text-secondary">TB Câu 2</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-text-secondary">TB Câu 3</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-text-secondary">TB Câu 4</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-text-secondary">TB Câu 5</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-text-primary font-bold">TB Chung</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-text-secondary">Số HS</th>
                </tr>
              </thead>
              <tbody>
                {teacherStats.map((teacher, index) => (
                  <tr key={`${teacher.teacher_id}-${teacher.class_name}`} className="border-t border-border hover:bg-bg-light/50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <td className="py-3 px-4">{teacher.teacher_name}</td>
                    <td className="py-3 px-4">{teacher.subject}</td>
                    <td className="py-3 px-4">{teacher.class_name}</td>
                    <td className="py-3 px-4 text-right">{formatScore(teacher.q1_avg)}</td>
                    <td className="py-3 px-4 text-right">{formatScore(teacher.q2_avg)}</td>
                    <td className="py-3 px-4 text-right">{formatScore(teacher.q3_avg)}</td>
                    <td className="py-3 px-4 text-right">{formatScore(teacher.q4_avg)}</td>
                    <td className="py-3 px-4 text-right">{formatScore(teacher.q5_avg)}</td>
                    <td className="py-3 px-4 text-right font-bold text-primary">{formatScore(teacher.total_avg)}</td>
                    <td className="py-3 px-4 text-right">{teacher.student_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Summary stats */}
      {!loading && teacherStats.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-text-secondary text-sm">Tổng số giáo viên</div>
            <div className="text-2xl font-bold text-primary">{teacherStats.length}</div>
          </Card>
          <Card>
            <div className="text-text-secondary text-sm">Tổng số HS tham gia</div>
            <div className="text-2xl font-bold text-primary">{students.length}</div>
          </Card>
          <Card>
            <div className="text-text-secondary text-sm">Điểm TB chung</div>
            <div className="text-2xl font-bold text-success">
              {(teacherStats.reduce((sum, t) => sum + t.total_avg, 0) / teacherStats.length).toFixed(2)}
            </div>
          </Card>
          <Card>
            <div className="text-text-secondary text-sm">Số câu hỏi mở</div>
            <div className="text-2xl font-bold text-primary">{openFeedbacks.length}</div>
          </Card>
        </div>
      )}
    </div>
  );
}