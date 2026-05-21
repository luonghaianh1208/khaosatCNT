'use client';

import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

interface SurveySession {
  id: string;
  name: string;
  school_year: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  description: string | null;
  created_at: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SurveySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<SurveySession | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    school_year: '2025-2026',
    start_date: '',
    end_date: '',
    description: '',
  });

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

  const handleOpenModal = (session?: SurveySession) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        name: session.name,
        school_year: session.school_year,
        start_date: session.start_date.split('T')[0],
        end_date: session.end_date.split('T')[0],
        description: session.description || '',
      });
    } else {
      setEditingSession(null);
      setFormData({
        name: '',
        school_year: '2025-2026',
        start_date: '',
        end_date: '',
        description: '',
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleSave = async () => {
    if (!formData.name || !formData.start_date || !formData.end_date) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        school_year: formData.school_year,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        description: formData.description || null,
      };

      if (editingSession) {
        await supabaseAdmin
          .from('survey_sessions')
          .update(payload)
          .eq('id', editingSession.id);
      } else {
        await supabaseAdmin
          .from('survey_sessions')
          .insert(payload);
      }

      setShowModal(false);
      fetchSessions();
    } catch (e) {
      setError('Đã xảy ra lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đợt khảo sát này?')) return;

    await supabaseAdmin
      .from('survey_sessions')
      .delete()
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
        <Button variant="primary" className="w-auto" onClick={() => handleOpenModal()}>
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
                    <td className="py-3 px-4">
                      <div className="font-medium">{session.name}</div>
                      {session.description && (
                        <div className="text-xs text-textSecondary mt-1">{session.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">{session.school_year}</td>
                    <td className="py-3 px-4 text-sm">
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
                          onClick={() => handleOpenModal(session)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="danger"
                          className="w-auto px-3 py-1 text-sm"
                          onClick={() => handleDelete(session.id)}
                        >
                          Xóa
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSession ? 'Sửa đợt khảo sát' : 'Tạo đợt khảo sát mới'}
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-crimson/10 border border-crimson text-crimson px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <Input
            label="Tên đợt khảo sát"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Khảo sát GV HK1 2025-2026"
            required
            disabled={saving}
          />

          <Input
            label="Năm học"
            value={formData.school_year}
            onChange={(e) => setFormData({ ...formData, school_year: e.target.value })}
            placeholder="2025-2026"
            required
            disabled={saving}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
              disabled={saving}
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">Mô tả (tùy chọn)</label>
            <textarea
              className="w-full px-3 py-2 text-sm font-sans border border-border rounded-button bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={saving}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}