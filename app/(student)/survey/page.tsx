'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { User, SurveySession, SurveyCompletion } from '@/lib/types';
import Button from '@/components/ui/Button';

export default function SurveyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeSession, setActiveSession] = useState<SurveySession | null>(null);
  const [completion, setCompletion] = useState<SurveyCompletion | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push('/login');
          return;
        }

        const { data: userProfile, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', authUser.id)
          .single();

        if (userError || !userProfile) {
          setError('Không tìm thấy thông tin người dùng');
          setLoading(false);
          return;
        }

        setUser(userProfile);

        const { data: session, error: sessionError } = await supabase
          .from('survey_sessions')
          .select('*')
          .eq('is_active', true)
          .single();

        if (sessionError && sessionError.code !== 'PGRST116') {
          setError('Không thể tải thông tin đợt khảo sát');
          setLoading(false);
          return;
        }

        if (!session) {
          setActiveSession(null);
          setLoading(false);
          return;
        }

        setActiveSession(session);

        const { data: completionData, error: completionError } = await supabase
          .from('survey_completion')
          .select('*')
          .eq('survey_session_id', session.id)
          .eq('user_id', userProfile.id)
          .single();

        if (completionError && completionError.code !== 'PGRST116') {
          setError('Không thể kiểm tra trạng thái nộp bài');
          setLoading(false);
          return;
        }

        setCompletion(completionData);
        setLoading(false);
      } catch {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-text-secondary">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-modal p-6 shadow-md text-center">
        <p className="text-crimson mb-4">{error}</p>
        <Button onClick={() => router.push('/login')}>Quay lại đăng nhập</Button>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="bg-white rounded-modal p-6 shadow-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-border flex items-center justify-center">
          <span className="text-2xl">📋</span>
        </div>
        <h2 className="text-lg font-medium text-text-primary mb-2">
          Không có đợt khảo sát nào đang hoạt động
        </h2>
        <p className="text-text-secondary mb-4">
          Hiện tại không có đợt khảo sát nào được mở. Vui lòng liên hệ với quản trị viên.
        </p>
        <Button onClick={() => router.push('/login')}>Quay lại đăng nhập</Button>
      </div>
    );
  }

  if (completion?.is_submitted) {
    return (
      <div className="bg-white rounded-modal p-6 shadow-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
          <span className="text-2xl">✅</span>
        </div>
        <h2 className="text-lg font-medium text-text-primary mb-2">
          Bạn đã hoàn thành khảo sát
        </h2>
        <p className="text-text-secondary mb-2">
          Cảm ơn bạn đã tham gia khảo sát. Kết quả của bạn đã được ghi nhận.
        </p>
        <p className="text-text-muted text-sm mb-6">
          Đợt khảo sát: {activeSession.name}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => router.push('/survey/edit')}>
            Xem / Chỉnh sửa
          </Button>
          <Button variant="secondary" onClick={() => router.push('/login')}>
            Đăng xuất
          </Button>
        </div>
      </div>
    );
  }

  const deadlineDate = new Date(activeSession.end_date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-modal p-6 shadow-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-2xl">📝</span>
        </div>
        <h2 className="text-xl font-medium text-text-primary mb-2">
          Chào mừng bạn đến với khảo sát
        </h2>
        <p className="text-text-secondary">
          Khảo sát được thực hiện hoàn toàn ẩn danh
        </p>
      </div>

      <div className="bg-bgLight rounded-modal p-4 mb-6">
        <h3 className="text-sm font-medium text-text-primary mb-3">Thông tin của bạn</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-text-muted">Họ và tên</p>
            <p className="text-text-primary font-medium">{user?.full_name}</p>
          </div>
          <div>
            <p className="text-text-muted">Lớp</p>
            <p className="text-text-primary font-medium">{user?.class_name}</p>
          </div>
        </div>
      </div>

      <div className="bg-bgLight rounded-modal p-4 mb-6">
        <h3 className="text-sm font-medium text-text-primary mb-3">Thông tin khảo sát</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Đợt khảo sát</span>
            <span className="text-text-primary">{activeSession.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Năm học</span>
            <span className="text-text-primary">{activeSession.school_year}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Hạn nộp</span>
            <span className="text-crimson font-medium">{deadlineDate}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={() => router.push('/survey/questions')}>
          Bắt đầu khảo sát
        </Button>
      </div>
    </div>
  );
}