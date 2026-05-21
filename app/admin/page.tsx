'use client';

import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase/server';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    submittedStudents: 0,
    totalTeachers: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: session } = await supabaseAdmin
        .from('survey_sessions')
        .select('id')
        .eq('is_active', true)
        .single();

      const { count: totalStudents } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: submittedStudents } = session?.id
        ? await supabaseAdmin
            .from('survey_completion')
            .select('*', { count: 'exact', head: true })
            .eq('survey_session_id', session.id)
            .eq('is_submitted', true)
        : { count: 0 };

      const { count: totalTeachers } = await supabaseAdmin
        .from('teachers')
        .select('*', { count: 'exact', head: true });

      let avgScore = 0;
      if (session?.id) {
        const { data: responses } = await supabaseAdmin
          .from('survey_responses')
          .select('total_score')
          .eq('survey_session_id', session.id);

        if (responses && responses.length > 0) {
          const total = responses.reduce((sum, r) => sum + (r.total_score || 0), 0);
          avgScore = Math.round((total / responses.length) * 100) / 100;
        }
      }

      setStats({
        totalStudents: totalStudents || 0,
        submittedStudents: submittedStudents || 0,
        totalTeachers: totalTeachers || 0,
        avgScore,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  const { totalStudents, submittedStudents, totalTeachers, avgScore } = stats;
  const completionPercentage = totalStudents > 0
    ? Math.round((submittedStudents / totalStudents) * 100)
    : 0;

  return (
    <div>
      <h1 className="text-28 font-bold text-textPrimary mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="text-12 text-textSecondary mb-1">Tổng số học sinh</div>
          <div className="text-28 font-bold text-primary">{totalStudents}</div>
        </Card>
        <Card>
          <div className="text-12 text-textSecondary mb-1">Tổng số giáo viên</div>
          <div className="text-28 font-bold text-primary">{totalTeachers}</div>
        </Card>
        <Card>
          <div className="text-12 text-textSecondary mb-1">Điểm TB toàn trường</div>
          <div className="text-28 font-bold text-primary">{avgScore}</div>
        </Card>
        <Card>
          <div className="text-12 text-textSecondary mb-1">Hoàn thành</div>
          <div className="text-28 font-bold text-success">{completionPercentage}%</div>
        </Card>
      </div>

      <Card>
        <h2 className="text-20 font-bold text-textPrimary mb-4">Tiến độ khảo sát</h2>
        <ProgressBar
          value={completionPercentage}
          label={`${submittedStudents} / ${totalStudents} học sinh đã nộp`}
        />
      </Card>
    </div>
  );
}