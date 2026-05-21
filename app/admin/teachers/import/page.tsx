'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import * as XLSX from 'xlsx';

interface TeacherRow {
  full_name: string;
  teacher_type: string;
  subject: string;
  subject_code: string;
  class_name: string;
}

interface ValidatedRow extends TeacherRow {
  isValid: boolean;
  errors: string[];
}

const VALID_TEACHER_TYPES = ['chuyen_chinh', 'chuyen_phu', 'bo_mon', 'chu_nhiem'];

const TEACHER_TYPE_LABELS: Record<string, string> = {
  chuyen_chinh: 'GV chuyên chính',
  chuyen_phu: 'GV chuyên phụ',
  bo_mon: 'GV bộ môn',
  chu_nhiem: 'GVCN',
};

function validateRow(row: TeacherRow, existingSubjectCodes: string[]): ValidatedRow {
  const errors: string[] = [];

  if (!row.full_name || row.full_name.trim() === '') {
    errors.push('Họ tên không được để trống');
  }

  if (!row.teacher_type || row.teacher_type.trim() === '') {
    errors.push('Loại giáo viên không được để trống');
  } else if (!VALID_TEACHER_TYPES.includes(row.teacher_type)) {
    errors.push(`Loại giáo viên phải là một trong: ${VALID_TEACHER_TYPES.join(', ')}`);
  }

  if (row.subject_code && row.subject_code.trim() !== '' && existingSubjectCodes.length > 0) {
    if (!existingSubjectCodes.includes(row.subject_code.trim())) {
      errors.push(`Mã môn "${row.subject_code}" không hợp lệ`);
    }
  }

  if (!row.class_name || row.class_name.trim() === '') {
    errors.push('Lớp không được để trống');
  }

  return {
    ...row,
    full_name: row.full_name?.trim() || '',
    teacher_type: row.teacher_type?.trim() || '',
    subject: row.subject?.trim() || '',
    subject_code: row.subject_code?.trim() || '',
    class_name: row.class_name?.trim() || '',
    isValid: errors.length === 0,
    errors,
  };
}

export default function ImportTeachersPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ValidatedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);

  const validCount = parsedData.filter((r) => r.isValid).length;
  const errorCount = parsedData.filter((r) => !r.isValid).length;

  const downloadTemplate = () => {
    const template = [
      {
        full_name: 'Nguyễn Văn A',
        teacher_type: 'chuyen_chinh',
        subject: 'Toán',
        subject_code: 'toan',
        class_name: '10A1',
      },
      {
        full_name: 'Nguyễn Văn A',
        teacher_type: 'chuyen_chinh',
        subject: 'Toán',
        subject_code: 'toan',
        class_name: '10A2',
      },
      {
        full_name: 'Trần Thị B',
        teacher_type: 'bo_mon',
        subject: 'Vật lý',
        subject_code: 'ly',
        class_name: '11A1',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Teachers');

    const colWidths = [
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'teacher_template.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<TeacherRow>(worksheet, { defval: '' });

      // For validation, we allow all subject codes since we don't have a subjects table
      const validated = jsonData.map((row) => {
        const processedRow = {
          full_name: String(row.full_name || '').trim(),
          teacher_type: String(row.teacher_type || '').trim(),
          subject: String(row.subject || '').trim(),
          subject_code: String(row.subject_code || '').trim(),
          class_name: String(row.class_name || '').trim(),
        };
        return validateRow(processedRow, []);
      });

      setParsedData(validated);
      setStep(3);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleImport = async () => {
    setImporting(true);
    let successCount = 0;

    const validRows = parsedData.filter((r) => r.isValid);

    // Group rows by teacher name to handle multi-class assignments
    const teacherMap = new Map<string, ValidatedRow[]>();
    for (const row of validRows) {
      const key = row.full_name;
      if (!teacherMap.has(key)) {
        teacherMap.set(key, []);
      }
      teacherMap.get(key)!.push(row);
    }

    // Upsert each teacher and create class assignments
    for (const [teacherName, rows] of teacherMap) {
      // Get unique classes for this teacher
      const classes = [...new Set(rows.map(r => r.class_name))];
      const firstRow = rows[0];

      // Upsert teacher
      const { data: teacher, error: teacherError } = await supabaseAdmin
        .from('teachers')
        .upsert(
          {
            full_name: teacherName,
            teacher_type: firstRow.teacher_type,
            subject: firstRow.subject || null,
            subject_code: firstRow.subject_code || null,
          },
          { onConflict: 'full_name' }
        )
        .select()
        .single();

      if (teacherError || !teacher) {
        continue;
      }

      // Get active survey session for assignments
      const { data: activeSession } = await supabaseAdmin
        .from('survey_sessions')
        .select('id')
        .eq('is_active', true)
        .single();

      if (activeSession) {
        // Create teacher_class_assignments for each class
        for (const className of classes) {
          await supabaseAdmin
            .from('teacher_class_assignments')
            .upsert(
              {
                teacher_id: teacher.id,
                survey_session_id: activeSession.id,
                class_name: className,
              },
              { onConflict: 'teacher_id,survey_session_id,class_name' }
            );
        }
      }

      successCount++;
    }

    setImportResult({ success: successCount, errors: errorCount });
    setImporting(false);
  };

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setParsedData([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (importResult) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-28 font-bold">Import giáo viên</h1>
        </div>

        <Card>
          <div className="text-center py-8">
            <div className="text-success text-5xl mb-4">✓</div>
            <h2 className="text-xl font-bold mb-2">Import thành công!</h2>
            <p className="text-textSecondary mb-6">
              Đã import <strong>{importResult.success}</strong> giáo viên thành công
              {importResult.errors > 0 && (
                <span className="text-crimson"> ({importResult.errors} dòng lỗi)</span>
              )}
            </p>
            <Button variant="primary" onClick={() => router.push('/admin/teachers')}>
              Quay về danh sách
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-28 font-bold">Import giáo viên</h1>
        <Button variant="secondary" className="w-auto" onClick={() => router.push('/admin/teachers')}>
          ← Quay về
        </Button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-textSecondary'}`}>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? 'bg-primary text-white' : 'bg-border text-textSecondary'}`}>
            1
          </span>
          <span className="text-sm font-medium">Tải file mẫu</span>
        </div>
        <div className="w-8 h-px bg-border" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-textSecondary'}`}>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? 'bg-primary text-white' : 'bg-border text-textSecondary'}`}>
            2
          </span>
          <span className="text-sm font-medium">Upload file</span>
        </div>
        <div className="w-8 h-px bg-border" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-textSecondary'}`}>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 3 ? 'bg-primary text-white' : 'bg-border text-textSecondary'}`}>
            3
          </span>
          <span className="text-sm font-medium">Xem trước & xác nhận</span>
        </div>
      </div>

      {/* Step 1 - Download Template */}
      {step === 1 && (
        <Card>
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📄</div>
            <h2 className="text-xl font-bold mb-2">Tải file mẫu</h2>
            <p className="text-textSecondary mb-6">
              Tải file mẫu Excel để điền thông tin giáo viên theo đúng định dạng
            </p>
            <Button variant="primary" onClick={downloadTemplate}>
              Tải file mẫu (.xlsx)
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-semibold mb-2">Cấu trúc file mẫu:</h3>
            <div className="text-sm text-textSecondary">
              <p><strong>full_name:</strong> Họ và tên đầy đủ</p>
              <p><strong>teacher_type:</strong> Loại giáo viên (chuyen_chinh / chuyen_phu / bo_mon / chu_nhiem)</p>
              <p><strong>subject:</strong> Môn dạy (VD: Toán, Vật lý) - optional</p>
              <p><strong>subject_code:</strong> Mã môn - optional</p>
              <p><strong>class_name:</strong> Tên lớp (VD: 10A1)</p>
            </div>
          </div>

          <div className="mt-4 text-sm text-textSecondary">
            <p className="font-semibold text-warning">Lưu ý:</p>
            <p>1 giáo viên có thể dạy nhiều lớp - hãy tạo nhiều dòng cho cùng 1 giáo viên với các lớp khác nhau.</p>
            <p>VD: Nguyễn Văn A dạy lớp 10A1 và 10A2 → 2 dòng với cùng full_name.</p>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={() => setStep(2)}>
              Đã có file → Tiếp tục
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2 - Upload File */}
      {step === 2 && (
        <Card>
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📤</div>
            <h2 className="text-xl font-bold mb-2">Upload file dữ liệu</h2>
            <p className="text-textSecondary mb-6">
              Chọn file Excel (.xlsx, .xls) hoặc CSV đã điền thông tin giáo viên
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Chọn file...
            </Button>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="secondary" onClick={() => setStep(1)}>
              ← Quay lại
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3 - Preview with Validation */}
      {step === 3 && (
        <>
          {/* Summary Badges */}
          <div className="flex gap-4 mb-4">
            <Badge variant="success">{validCount} dòng hợp lệ</Badge>
            {errorCount > 0 && <Badge variant="danger">{errorCount} dòng lỗi</Badge>}
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary w-12">#</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Trạng thái</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Họ tên</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Loại</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Môn</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Mã môn</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Lớp</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Lỗi</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b border-border ${row.isValid ? 'bg-success/5' : 'bg-crimson/5'}`}
                    >
                      <td className="py-3 px-4 text-sm">{index + 1}</td>
                      <td className="py-3 px-4">
                        {row.isValid ? (
                          <span className="text-success text-lg">✓</span>
                        ) : (
                          <span className="text-crimson text-lg">✗</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">{row.full_name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">
                          {TEACHER_TYPE_LABELS[row.teacher_type] || row.teacher_type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{row.subject || '-'}</td>
                      <td className="py-3 px-4 text-sm">{row.subject_code || '-'}</td>
                      <td className="py-3 px-4 text-sm">{row.class_name}</td>
                      <td className="py-3 px-4 text-sm text-crimson">
                        {row.errors.length > 0 ? row.errors.join('; ') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="secondary" onClick={handleReset}>
                Chọn file khác
              </Button>
              <Button
                variant="primary"
                disabled={validCount === 0 || importing}
                onClick={handleImport}
              >
                {importing ? 'Đang import...' : 'Xác nhận import'}
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}