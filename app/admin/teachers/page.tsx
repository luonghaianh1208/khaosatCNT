'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher, addTeacherAssignment, deleteTeacherAssignment, deleteManyTeachers } from '@/app/admin/actions';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

interface TeacherAssignment {
  id: string;
  class_name: string;
}

interface Teacher {
  id: string;
  full_name: string;
  teacher_type: string;
  subject: string | null;
  subject_code: string | null;
  teacher_class_assignments?: TeacherAssignment[];
}

const TEACHER_TYPE_LABELS: Record<string, string> = {
  chuyen_chinh: 'GV chuyên chính',
  chuyen_phu: 'GV chuyên phụ',
  bo_mon: 'GV bộ môn',
  chu_nhiem: 'GVCN',
};

const TEACHER_TYPE_VARIANTS: Record<string, 'primary' | 'success' | 'secondary' | 'warning'> = {
  chuyen_chinh: 'primary',
  chuyen_phu: 'success',
  bo_mon: 'secondary',
  chu_nhiem: 'warning',
};

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    teacher_type: 'bo_mon',
    subject: '',
    subject_code: '',
  });

  const fetchTeachers = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getTeachers(search, typeFilter);
      setTeachers(data || []);
    } catch {
      setFetchError('Không thể tải danh sách giáo viên. Vui lòng kiểm tra cấu hình Supabase.');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [search, typeFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giáo viên này?')) return;
    await deleteTeacher(id);
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    fetchTeachers();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.size} giáo viên đã chọn?`)) return;
    setDeleting(true);
    try {
      await deleteManyTeachers(Array.from(selectedIds));
      setSelectedIds(new Set());
      fetchTeachers();
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
    if (selectedIds.size === teachers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(teachers.map(t => t.id)));
    }
  };

  const handleOpenModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        full_name: teacher.full_name,
        teacher_type: teacher.teacher_type,
        subject: teacher.subject || '',
        subject_code: teacher.subject_code || '',
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        full_name: '',
        teacher_type: 'bo_mon',
        subject: '',
        subject_code: '',
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleSave = async () => {
    if (!formData.full_name) {
      setError('Vui lòng nhập tên giáo viên');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        full_name: formData.full_name,
        teacher_type: formData.teacher_type,
        subject: formData.subject || null,
        subject_code: formData.subject_code || null,
      };

      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, payload);
      } else {
        await createTeacher(payload);
      }

      setShowModal(false);
      fetchTeachers();
    } catch (e) {
      setError('Đã xảy ra lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAssignment = async () => {
    if (!selectedTeacher || !newClassName) return;

    try {
      await addTeacherAssignment(selectedTeacher.id, newClassName);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Đã xảy ra lỗi');
      return;
    }

    setShowAssignmentModal(false);
    setNewClassName('');
    setSelectedTeacher(null);
    fetchTeachers();
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phân công này?')) return;
    await deleteTeacherAssignment(assignmentId);
    fetchTeachers();
  };

  const getClassesDisplay = (assignments?: TeacherAssignment[]) => {
    if (!assignments || assignments.length === 0) return '-';
    return assignments.map(a => a.class_name).join(', ');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-28 font-bold">Quản lý giáo viên</h1>
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
          <Button
            variant="secondary"
            className="w-auto"
            onClick={() => router.push('/admin/teachers/import')}
          >
            Import
          </Button>
          <Button variant="primary" className="w-auto" onClick={() => handleOpenModal()}>
            + Thêm mới
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="mb-4 bg-crimson/10 border border-crimson text-crimson px-4 py-3 rounded text-sm">
          {fetchError}
        </div>
      )}

      {/* Filter Row */}
      <Card className="mb-6">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 text-sm font-sans border border-border rounded-button bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary w-80"
          />
          <select
            className="px-3 py-2 text-sm font-sans border border-border rounded-button bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tất cả loại</option>
            <option value="chuyen_chinh">GV chuyên chính</option>
            <option value="chuyen_phu">GV chuyên phụ</option>
            <option value="bo_mon">GV bộ môn</option>
            <option value="chu_nhiem">GVCN</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8 text-textSecondary">Đang tải...</div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-8 text-textSecondary">
            <div className="mb-2">Chưa có giáo viên nào</div>
            <p className="text-sm">Nhấn "+ Thêm mới" hoặc "Import" để bắt đầu</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-light">
                  <th className="py-4 px-4 w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-primary cursor-pointer"
                      checked={teachers.length > 0 && selectedIds.size === teachers.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-textSecondary">Họ tên</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-textSecondary">Loại</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-textSecondary">Môn</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-textSecondary">Lớp</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-textSecondary">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher, index) => (
                  <tr
                    key={teacher.id}
                    className={`border-t border-border hover:bg-bg-light/50 transition-colors animate-fade-in ${selectedIds.has(teacher.id) ? 'bg-primary/5' : ''}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-primary cursor-pointer"
                        checked={selectedIds.has(teacher.id)}
                        onChange={() => toggleSelect(teacher.id)}
                      />
                    </td>
                    <td className="py-3 px-4">{teacher.full_name}</td>
                    <td className="py-3 px-4">
                      <Badge variant={TEACHER_TYPE_VARIANTS[teacher.teacher_type] || 'secondary'}>
                        {TEACHER_TYPE_LABELS[teacher.teacher_type] || teacher.teacher_type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {teacher.subject || '-'}
                      {teacher.subject_code && <span className="text-textSecondary text-xs ml-1">({teacher.subject_code})</span>}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {getClassesDisplay(teacher.teacher_class_assignments)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="w-auto px-3 py-1 text-sm"
                          size="sm"
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setShowAssignmentModal(true);
                          }}
                        >
                          + Lớp
                        </Button>
                        <Button
                          variant="secondary"
                          className="w-auto px-3 py-1 text-sm"
                          size="sm"
                          onClick={() => handleOpenModal(teacher)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-auto px-3 py-1 text-sm text-crimson hover:bg-crimson/10"
                          size="sm"
                          onClick={() => handleDelete(teacher.id)}
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

      {/* Add/Edit Teacher Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTeacher ? 'Sửa giáo viên' : 'Thêm giáo viên mới'}
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-crimson/10 border border-crimson text-crimson px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <Input
            label="Họ tên"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Nguyễn Văn A"
            required
            disabled={saving}
          />

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">Loại giáo viên</label>
            <select
              className="w-full px-3 py-2 text-sm font-sans border border-border rounded-button bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.teacher_type}
              onChange={(e) => setFormData({ ...formData, teacher_type: e.target.value })}
              disabled={saving}
            >
              <option value="chuyen_chinh">GV chuyên chính</option>
              <option value="chuyen_phu">GV chuyên phụ</option>
              <option value="bo_mon">GV bộ môn</option>
              <option value="chu_nhiem">GVCN</option>
            </select>
          </div>

          <Input
            label="Môn dạy"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Toán, Vật lý,..."
            disabled={saving}
          />

          <Input
            label="Mã môn"
            value={formData.subject_code}
            onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
            placeholder="toan, ly, hoa,..."
            disabled={saving}
          />

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

      {/* Add Class Assignment Modal */}
      <Modal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedTeacher(null);
          setNewClassName('');
        }}
        title="Phân công lớp giảng dạy"
      >
        <div className="space-y-4">
          <p className="text-sm text-textSecondary">
            Đang phân công cho: <strong>{selectedTeacher?.full_name}</strong>
          </p>

          <Input
            label="Tên lớp"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="10 Toán, 10 Lý,..."
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => {
              setShowAssignmentModal(false);
              setSelectedTeacher(null);
              setNewClassName('');
            }}>
              Hủy
            </Button>
            <Button onClick={handleAddAssignment}>
              Thêm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}