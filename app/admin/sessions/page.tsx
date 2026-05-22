'use client';

import { useEffect, useState } from 'react';
import { getSessions, createSession, updateSession, deleteSession, toggleSessionActive, deleteManySessions } from '@/app/admin/actions';
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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    school_year: '2025-2026',
    start_date: '',
    start_time: '07:00',
    end_date: '',
    end_time: '23:55',
    description: '',
  });

  const fetchSessions = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getSessions();
      setSessions(data || []);
    } catch {
      setFetchError('Không thể tải danh sách đợt khảo sát. Vui lòng kiểm tra cấu hình Supabase.');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await toggleSessionActive(id, !currentStatus);
    fetchSessions();
  };

  const handleOpenModal = (session?: SurveySession) => {
    if (session) {
      setEditingSession(session);
      const sd = new Date(session.start_date);
      const ed = new Date(session.end_date);
      const pad = (n: number) => String(n).padStart(2, '0');
      setFormData({
        name: session.name,
        school_year: session.school_year,
        start_date: session.start_date.split('T')[0],
        start_time: `${pad(sd.getHours())}:${pad(sd.getMinutes())}`,
        end_date: session.end_date.split('T')[0],
        end_time: `${pad(ed.getHours())}:${pad(ed.getMinutes())}`,
        description: session.description || '',
      });
    } else {
      setEditingSession(null);
      setFormData({
        name: '',
        school_year: '2025-2026',
        start_date: '',
        start_time: '07:00',
        end_date: '',
        end_time: '23:55',
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
        start_date: new Date(`${formData.start_date}T${formData.start_time}`).toISOString(),
        end_date: new Date(`${formData.end_date}T${formData.end_time}`).toISOString(),
        description: formData.description || null,
      };

      if (editingSession) {
        await updateSession(editingSession.id, payload);
      } else {
        await createSession(payload);
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
    await deleteSession(id);
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    fetchSessions();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.size} đợt khảo sát đã chọn?`)) return;
    setDeleting(true);
    try {
      await deleteManySessions(Array.from(selectedIds));
      setSelectedIds(new Set());
      fetchSessions();
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sessions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sessions.map(s => s.id)));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-text-primary">Quản lý đợt khảo sát</h1>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="ghost"
              className="w-auto text-crimson border border-crimson hover:bg-crimson/10"
              onClick={handleBulkDelete}
              disabled={deleting}
            >
              {deleting ? 'Đang xóa...' : `Xóa ${selectedIds.size} mục`}
            </Button>
          )}
          <Button variant="primary" className="w-auto" onClick={() => handleOpenModal()}>
            + Tạo mới
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="mb-4 bg-crimson/10 border border-crimson text-crimson px-4 py-3 rounded-xl text-sm">
          {fetchError}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="text-center py-8 text-text-secondary">Đang tải...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <div className="mb-2">Chưa có đợt khảo sát nào</div>
            <p className="text-sm">Nhấn "+ Tạo mới" để bắt đầu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-light">
                  <th className="py-4 px-4 w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-primary cursor-pointer"
                      checked={sessions.length > 0 && selectedIds.size === sessions.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-text-secondary">Tên đợt khảo sát</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-text-secondary">Năm học</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-text-secondary">Thời hạn</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-text-secondary">Trạng thái</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-text-secondary">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr
                    key={session.id}
                    className={`border-t border-border hover:bg-bg-light/50 transition-colors animate-fade-in ${selectedIds.has(session.id) ? 'bg-primary/5' : ''}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-primary cursor-pointer"
                        checked={selectedIds.has(session.id)}
                        onChange={() => toggleSelect(session.id)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{session.name}</div>
                      {session.description && (
                        <div className="text-xs text-text-secondary mt-1">{session.description}</div>
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
                          size="sm"
                          onClick={() => toggleActive(session.id, session.is_active)}
                        >
                          {session.is_active ? 'Tắt' : 'Bật'}
                        </Button>
                        <Button
                          variant="secondary"
                          className="w-auto px-3 py-1 text-sm"
                          size="sm"
                          onClick={() => handleOpenModal(session)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-auto px-3 py-1 text-sm text-crimson hover:bg-crimson/10"
                          size="sm"
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
            <div className="bg-crimson/10 border border-crimson text-crimson px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          <Input
            label="Tên đợt khảo sát"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Khảo sát GV năm học 2025-2026"
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
            {(['start', 'end'] as const).map((key) => {
              const dateKey = `${key}_date` as 'start_date' | 'end_date';
              const timeKey = `${key}_time` as 'start_time' | 'end_time';
              const label = key === 'start' ? 'Ngày bắt đầu' : 'Ngày kết thúc';
              const [hh, mm] = formData[timeKey].split(':');
              const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
              const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
              return (
                <div key={key} className="space-y-1">
                  <label className="block text-sm font-medium text-text-primary">
                    {label} <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    value={formData[dateKey]}
                    onChange={(e) => setFormData({ ...formData, [dateKey]: e.target.value })}
                    required
                    disabled={saving}
                  />
                  <div className="flex items-center gap-2 bg-bg-light border border-border rounded-xl px-3 py-2">
                    <span className="text-text-secondary text-xs font-medium">Giờ</span>
                    <select
                      value={hh}
                      onChange={(e) => setFormData({ ...formData, [timeKey]: `${e.target.value}:${mm}` })}
                      className="flex-1 text-sm bg-transparent border-none outline-none text-text-primary cursor-pointer font-medium"
                      disabled={saving}
                    >
                      {hours.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="text-text-secondary font-bold">:</span>
                    <select
                      value={mm}
                      onChange={(e) => setFormData({ ...formData, [timeKey]: `${hh}:${e.target.value}` })}
                      className="flex-1 text-sm bg-transparent border-none outline-none text-text-primary cursor-pointer font-medium"
                      disabled={saving}
                    >
                      {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Mô tả (tùy chọn)</label>
            <textarea
              className="w-full px-3 py-2 text-sm font-sans border border-border rounded-xl bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
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