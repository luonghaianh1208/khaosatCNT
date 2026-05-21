'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/app/admin/actions';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { Users, GraduationCap, Target, CheckCircle, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    submittedStudents: 0,
    totalTeachers: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then((data) => { if (data) setStats(data); })
      .catch(() => setFetchError('Không thể tải dữ liệu dashboard. Vui lòng kiểm tra cấu hình Supabase.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  const { totalStudents = 0, submittedStudents = 0, totalTeachers = 0, avgScore = 0 } = stats ?? {};
  const completionPercentage = totalStudents > 0
    ? Math.round((submittedStudents / totalStudents) * 100)
    : 0;

  return (
    <div>
      {fetchError && (
        <div className="mb-6 bg-crimson/10 border border-crimson text-crimson px-4 py-3 rounded text-sm">
          {fetchError}
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-28 font-bold text-textPrimary mb-2">Dashboard</h1>
        <p className="text-16 text-textSecondary">Tổng quan về đợt khảo sát hiện tại</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card hoverable className="border-l-4 border-l-primary">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-12 text-textSecondary mb-1">Tổng số học sinh</div>
              <div className="text-28 font-bold text-textPrimary">{totalStudents}</div>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
        <Card hoverable className="border-l-4 border-l-secondary-nav">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-12 text-textSecondary mb-1">Tổng số giáo viên</div>
              <div className="text-28 font-bold text-textPrimary">{totalTeachers}</div>
            </div>
            <div className="p-3 bg-secondary-nav/10 rounded-lg">
              <GraduationCap className="w-6 h-6 text-secondary-nav" />
            </div>
          </div>
        </Card>
        <Card hoverable className="border-l-4 border-l-warning">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-12 text-textSecondary mb-1">Điểm TB toàn trường</div>
              <div className="text-28 font-bold text-textPrimary">{avgScore}</div>
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <Target className="w-6 h-6 text-warning" />
            </div>
          </div>
        </Card>
        <Card hoverable className="border-l-4 border-l-success">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-12 text-textSecondary mb-1">Hoàn thành khảo sát</div>
              <div className="text-28 font-bold text-success">{completionPercentage}%</div>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-20 font-bold text-textPrimary">Tiến độ khảo sát</h2>
          <div className="flex items-center gap-2 text-14 text-textSecondary">
            <TrendingUp className="w-4 h-4" />
            <span>{submittedStudents} / {totalStudents} học sinh</span>
          </div>
        </div>
        <ProgressBar
          value={completionPercentage}
          size="lg"
          variant="success"
          showLabel={false}
          className="mb-3"
        />
        <ProgressBar
          value={completionPercentage}
          label={`${submittedStudents} / ${totalStudents} học sinh đã nộp`}
          size="sm"
          variant="primary"
        />
      </Card>
    </div>
  );
}