'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStudents, createStudent, updateStudent, deleteStudent, toggleStudentActive } from '@/app/admin/actions';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';

interface Student {
  id: string;
  username: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  grade: string;
  class_name: string;
  is_active: boolean;
}

interface NewStudentForm {
  username: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  grade: string;
  class_name: string;
  password: string;
}

interface EditStudentForm {
  full_name: string;
  date_of_birth: string;
  gender: string;
  grade: string;
  class_name: string;
  is_active: boolean;
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [newStudent, setNewStudent] = useState<NewStudentForm>({
    username: '',
    full_name: '',
    date_of_birth: '',
    gender: 'Nam',
    grade: '10',
    class_name: '',
    password: 'Haiphong@2026',
  });

  const [editForm, setEditForm] = useState<EditStudentForm>({
    full_name: '',
    date_of_birth: '',
    gender: 'Nam',
    grade: '10',
    class_name: '',
    is_active: true,
  });

  const fetchStudents = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getStudents(search, gradeFilter);
      setStudents(data || []);
    } catch {
      setFetchError('Không thể tải danh sách học sinh. Vui lòng kiểm tra cấu hình Supabase.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, gradeFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa học sinh này?')) return;
    await deleteStudent(id);
    fetchStudents();
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setEditForm({
      full_name: student.full_name,
      date_of_birth: student.date_of_birth ? formatDateForInput(student.date_of_birth) : '',
      gender: student.gender || 'Nam',
      grade: student.grade,
      class_name: student.class_name,
      is_active: student.is_active,
    });
    setShowEditModal(true);
    setAddError('');
  };

  const formatDateForInput = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent || !editForm.full_name || !editForm.class_name) {
      setAddError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setAdding(true);
    setAddError('');

    try {
      let dob = editForm.date_of_birth || null;
      if (editForm.date_of_birth) {
        const parts = editForm.date_of_birth.split('/');
        if (parts.length === 3) {
          const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          dob = date.toISOString().split('T')[0];
        }
      }

      await updateStudent(editingStudent.id, {
        full_name: editForm.full_name,
        date_of_birth: dob,
        gender: editForm.gender,
        grade: editForm.grade,
        class_name: editForm.class_name,
        is_active: editForm.is_active,
      });

      setShowEditModal(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      setAddError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (student: Student) => {
    await toggleStudentActive(student.id, !student.is_active);
    fetchStudents();
  };

  const handleAddStudent = async () => {
    setAddError('');
    setAdding(true);

    try {
      // Parse date
      const parts = newStudent.date_of_birth.split('/');
      let dob = newStudent.date_of_birth;
      if (parts.length === 3) {
        const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        dob = date.toISOString().split('T')[0];
      }

      await createStudent({ ...newStudent, date_of_birth: dob });

      setShowAddModal(false);
      setNewStudent({
        username: '',
        full_name: '',
        date_of_birth: '',
        gender: 'Nam',
        grade: '10',
        class_name: '',
        password: 'Haiphong@2026',
      });
      fetchStudents();
    } catch (error) {
      setAddError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-28 font-bold">Quản lý học sinh</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="w-auto"
            onClick={() => router.push('/admin/students/import')}
          >
            Import
          </Button>
          <Button variant="primary" className="w-auto" onClick={() => setShowAddModal(true)}>
            + Thêm mới
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <Card className="mb-6">
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Tìm kiếm theo tên hoặc username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-80"
          />
          <select
            className="px-3 py-2 text-sm font-sans border border-border rounded-button bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="">Tất cả khối</option>
            <option value="10">Khối 10</option>
            <option value="11">Khối 11</option>
            <option value="12">Khối 12</option>
          </select>
        </div>
      </Card>

      {fetchError && (
        <div className="mb-4 bg-crimson/10 border border-crimson text-crimson px-4 py-3 rounded text-sm">
          {fetchError}
        </div>
      )}

      {/* Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8 text-textSecondary">Đang tải...</div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 text-textSecondary">
            <div className="mb-2">Chưa có học sinh nào</div>
            <p className="text-sm">Nhấn "+ Thêm mới" hoặc "Import" để bắt đầu</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-light">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-textSecondary">Username</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-textSecondary">Họ tên</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-textSecondary">Lớp</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-textSecondary">Trạng thái</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-textSecondary">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id} className="border-t border-border hover:bg-bg-light/50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <td className="py-3 px-4">{student.username}</td>
                    <td className="py-3 px-4">{student.full_name}</td>
                    <td className="py-3 px-4">
                      {student.grade ? `Khối ${student.grade}` : ''} {student.class_name}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={student.is_active ? 'success' : 'secondary'}>
                        {student.is_active ? 'Hoạt động' : 'Tắt'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="w-auto px-3 py-1 text-sm"
                          size="sm"
                          onClick={() => handleOpenEditModal(student)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-auto px-3 py-1 text-sm text-crimson hover:bg-crimson/10"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
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

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm học sinh mới"
      >
        <div className="space-y-4">
          {addError && (
            <div className="bg-crimson/10 border border-crimson text-crimson px-4 py-2 rounded text-sm">
              {addError}
            </div>
          )}

          <Input
            label="Username"
            value={newStudent.username}
            onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
            required
            disabled={adding}
          />

          <Input
            label="Họ và tên"
            value={newStudent.full_name}
            onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
            required
            disabled={adding}
          />

          <Input
            label="Ngày sinh (DD/MM/YYYY)"
            value={newStudent.date_of_birth}
            onChange={(e) => setNewStudent({ ...newStudent, date_of_birth: e.target.value })}
            placeholder="01/01/2010"
            required
            disabled={adding}
          />

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">Giới tính</label>
            <select
              className="w-full px-3 py-2 text-sm font-sans border border-border rounded-button bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              value={newStudent.gender}
              onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
              disabled={adding}
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">Khối</label>
              <select
                className="w-full px-3 py-2 text-sm font-sans border border-border rounded-button bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                value={newStudent.grade}
                onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                disabled={adding}
              >
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </select>
            </div>

            <Input
              label="Lớp"
              value={newStudent.class_name}
              onChange={(e) => setNewStudent({ ...newStudent, class_name: e.target.value })}
              placeholder="10A1"
              required
              disabled={adding}
            />
          </div>

          <Input
            label="Mật khẩu"
            type="text"
            value={newStudent.password}
            onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
            disabled={adding}
          />
          <p className="text-xs text-text-muted -mt-2">Mặc định: Haiphong@2026</p>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={adding}>
              Hủy
            </Button>
            <Button onClick={handleAddStudent} disabled={adding}>
              {adding ? 'Đang thêm...' : 'Thêm học sinh'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Chỉnh sửa học sinh"
      >
        <div className="space-y-4">
          {addError && (
            <div className="bg-crimson/10 border border-crimson text-crimson px-4 py-2 rounded text-sm">
              {addError}
            </div>
          )}

          <Input
            label="Họ và tên"
            value={editForm.full_name}
            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
            required
            disabled={adding}
          />

          <Input
            label="Ngày sinh (YYYY-MM-DD)"
            type="date"
            value={editForm.date_of_birth}
            onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
            disabled={adding}
          />

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">Giới tính</label>
            <select
              className="w-full px-3 py-2 text-sm font-sans border border-border rounded-button bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              value={editForm.gender}
              onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
              disabled={adding}
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">Khối</label>
              <select
                className="w-full px-3 py-2 text-sm font-sans border border-border rounded-button bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                value={editForm.grade}
                onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                disabled={adding}
              >
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </select>
            </div>

            <Input
              label="Lớp"
              value={editForm.class_name}
              onChange={(e) => setEditForm({ ...editForm, class_name: e.target.value })}
              placeholder="10A1"
              required
              disabled={adding}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">Trạng thái</label>
            <select
              className="w-full px-3 py-2 text-sm font-sans border border-border rounded-button bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              value={editForm.is_active ? 'true' : 'false'}
              onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}
              disabled={adding}
            >
              <option value="true">Hoạt động</option>
              <option value="false">Tắt</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={adding}>
              Hủy
            </Button>
            <Button onClick={handleUpdateStudent} disabled={adding}>
              {adding ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}