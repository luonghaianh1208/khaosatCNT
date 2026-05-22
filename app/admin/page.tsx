'use client';

import { useEffect, useRef, useState } from 'react';
import { getDashboardStats } from '@/app/admin/actions';
import { supabase } from '@/lib/supabase/client';
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
  const [isLive, setIsLive] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchStats = () =>
    getDashboardStats()
      .then((data) => { if (data) setStats(data); })
      .catch(() => setFetchError('Không thể tải dữ liệu dashboard. Vui lòng kiểm tra cấu hình Supabase.'))
      .finally(() => setLoading(false));

  const debouncedFetch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchStats, 3000);
  };

  useEffect(() => {
    fetchStats();

    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'survey_completion' }, debouncedFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'survey_responses' }, debouncedFetch)
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        <div className="mb-6 bg-crimson/10 border border-[#dc3545] text-crimson px-4 py-3 rounded-xl text-sm">
          {fetchError}
        </div>
      )}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary mb-1">Dashboard</h1>
          <p className="text-sm text-text-secondary">Tổng quan về đợt khảo sát hiện tại</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={`inline-block w-2 h-2 rounded-full ${isLive ? 'bg-success animate-pulse' : 'bg-border'}`} />
          <span className={isLive ? 'text-success font-medium' : 'text-text-secondary'}>
            {isLive ? 'Live' : 'Đang kết nối...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card hoverable className="border-l-4 border-l-primary">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-text-secondary mb-1">Tổng số học sinh</div>
              <div className="text-xl font-bold text-text-primary">{totalStudents}</div>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
        <Card hoverable className="border-l-4 border-l-secondary-nav">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-text-secondary mb-1">Tổng số giáo viên</div>
              <div className="text-xl font-bold text-text-primary">{totalTeachers}</div>
            </div>
            <div className="p-3 bg-secondary-nav/10 rounded-xl">
              <GraduationCap className="w-6 h-6 text-secondary-nav" />
            </div>
          </div>
        </Card>
        <Card hoverable className="border-l-4 border-l-warning">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-text-secondary mb-1">Điểm TB toàn trường</div>
              <div className="text-xl font-bold text-text-primary">{avgScore}</div>
            </div>
            <div className="p-3 bg-warning/10 rounded-xl">
              <Target className="w-6 h-6 text-warning" />
            </div>
          </div>
        </Card>
        <Card hoverable className="border-l-4 border-l-success">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-text-secondary mb-1">Hoàn thành khảo sát</div>
              <div className="text-xl font-bold text-success">{completionPercentage}%</div>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">Tiến độ khảo sát</h2>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <TrendingUp className="w-4 h-4" />
            <span>{submittedStudents} / {totalStudents} học sinh đã nộp</span>
          </div>
        </div>
        <div className="h-3 bg-bg-disabled rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-primary rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="text-right">
          <span className="text-xs text-text-muted">{completionPercentage}% hoàn thành</span>
        </div>
      </Card>
    </div>
  );
}