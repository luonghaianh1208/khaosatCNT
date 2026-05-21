'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

interface TeacherAssignment {
  id: string;
  class_name: string;
  survey_session?: {
    name: string;
  };
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

  const fetchTeachers = async () => {
    setLoading(true);
    let query = supabaseAdmin
      .from('teachers')
      .select(`
        *,
        teacher_class_assignments (
          id,
          class_name
        )
      `)
      .order('full_name', { ascending: true });

    if (search) {
      query = query.ilike('full_name', `%${search}%`);
    }

    if (typeFilter) {
      query = query.eq('teacher_type', typeFilter);
    }

    const { data } = await query;
    setTeachers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, [search, typeFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giáo viên này?')) return;

    await supabaseAdmin
      .from('teachers')
      .delete()
      .eq('id', id);
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
          <Button
            variant="secondary"
            className="w-auto"
            onClick={() => router.push('/admin/teachers/import')}
          >
            Import
          </Button>
          <Button variant="primary" className="w-auto">
            + Thêm mới
          </Button>
        </div>
      </div>

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
          <div className="text-center py-8 text-textSecondary">Chưa có giáo viên nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Họ tên</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Loại</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Môn</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Lớp</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b border-border hover:bg-bgLight">
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
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="danger"
                          className="w-auto px-3 py-1 text-sm"
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
    </div>
  );
}