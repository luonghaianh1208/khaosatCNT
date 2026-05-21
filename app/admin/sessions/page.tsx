'use client';

import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase/server';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface SurveySession {
  id: string;
  name: string;
  school_year: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SurveySession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    const { data } = await supabaseAdmin
      .from('survey_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    setSessions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await supabaseAdmin
      .from('survey_sessions')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    fetchSessions();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-28 font-bold">Quản lý đợt khảo sát</h1>
        <Button variant="primary" className="w-auto">
          + Tạo mới
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8 text-textSecondary">Đang tải...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-textSecondary">Chưa có đợt khảo sát nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Tên đợt khảo sát</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Năm học</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Thời hạn</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Trạng thái</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-border hover:bg-bgLight">
                    <td className="py-3 px-4">{session.name}</td>
                    <td className="py-3 px-4">{session.school_year}</td>
                    <td className="py-3 px-4">
                      {formatDate(session.start_date)} - {formatDate(session.end_date)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={session.is_active ? 'success' : 'secondary'}>
                        {session.is_active ? 'Đang hoạt động' : 'Tắt'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant={session.is_active ? 'secondary' : 'primary'}
                          className="w-auto px-3 py-1 text-sm"
                          onClick={() => toggleActive(session.id, session.is_active)}
                        >
                          {session.is_active ? 'Tắt' : 'Bật'}
                        </Button>
                        <Button
                          variant="secondary"
                          className="w-auto px-3 py-1 text-sm"
                        >
                          Sửa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}