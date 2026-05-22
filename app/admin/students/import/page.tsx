'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { importStudents } from '@/app/admin/actions';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import * as XLSX from 'xlsx';

interface StudentRow {
  'Tên đăng nhập': string;
  'Mật khẩu'?: string;
  'Họ tên': string;
  'Ngày sinh': string;
  'Giới tính': string;
  'Khối': string;
  'Lớp': string;
}

interface ValidatedRow extends StudentRow {
  isValid: boolean;
  errors: string[];
  processedPassword: string;
}

const VALID_GENDERS = ['Nam', 'Nữ', 'Khác'];
const VALID_GRADES = ['10', '11', '12'];
const DEFAULT_PASSWORD = 'Haiphong@2026';

function validateRow(row: StudentRow): ValidatedRow {
  const errors: string[] = [];

  if (!row['Tên đăng nhập'] || row['Tên đăng nhập'].trim() === '') {
    errors.push('Tên đăng nhập không được để trống');
  }

  if (!row['Họ tên'] || row['Họ tên'].trim() === '') {
    errors.push('Họ tên không được để trống');
  }

  if (!row['Ngày sinh'] || row['Ngày sinh'].trim() === '') {
    errors.push('Ngày sinh không được để trống');
  } else {
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(row['Ngày sinh'])) {
      errors.push('Ngày sinh phải theo định dạng DD/MM/YYYY');
    }
  }

  if (!row['Giới tính'] || row['Giới tính'].trim() === '') {
    errors.push('Giới tính không được để trống');
  } else if (!VALID_GENDERS.includes(row['Giới tính'])) {
    errors.push(`Giới tính phải là một trong: ${VALID_GENDERS.join(', ')}`);
  }

  if (!row['Khối'] || row['Khối'].trim() === '') {
    errors.push('Khối không được để trống');
  } else if (!VALID_GRADES.includes(row['Khối'])) {
    errors.push(`Khối phải là một trong: ${VALID_GRADES.join(', ')}`);
  }

  if (!row['Lớp'] || row['Lớp'].trim() === '') {
    errors.push('Lớp không được để trống');
  }

  const processedPassword = (row['Mật khẩu'] && row['Mật khẩu'].trim() !== '') ? row['Mật khẩu'].trim() : DEFAULT_PASSWORD;

  return {
    ...row,
    isValid: errors.length === 0,
    errors,
    processedPassword,
  };
}

function parseDate(dateStr: string): string {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  }
  return dateStr;
}

export default function ImportStudentsPage() {
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
        'Tên đăng nhập': 'hs001',
        'Mật khẩu': '',
        'Họ tên': 'Nguyễn Văn A',
        'Ngày sinh': '01/01/2010',
        'Giới tính': 'Nam',
        'Khối': '10',
        'Lớp': '10A1',
      },
      {
        'Tên đăng nhập': 'hs002',
        'Mật khẩu': 'MyPassword123',
        'Họ tên': 'Trần Thị B',
        'Ngày sinh': '15/03/2010',
        'Giới tính': 'Nữ',
        'Khối': '10',
        'Lớp': '10A2',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Học sinh');

    const colWidths = [
      { wch: 18 },
      { wch: 18 },
      { wch: 28 },
      { wch: 14 },
      { wch: 10 },
      { wch: 8 },
      { wch: 10 },
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'Mau_Import_Hoc_Sinh.xlsx');
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
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

      const validated = jsonData.map((row) => {
        const normalized = Object.fromEntries(
          Object.entries(row).map(([k, v]) => [k, String(v ?? '')])
        ) as unknown as StudentRow;
        return validateRow(normalized);
      });

      setParsedData(validated);
      setStep(3);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleImport = async () => {
    setImporting(true);

    const validRows = parsedData.filter((r) => r.isValid).map((row) => ({
      username: row['Tên đăng nhập'],
      full_name: row['Họ tên'],
      date_of_birth: parseDate(row['Ngày sinh']),
      gender: row['Giới tính'],
      grade: row['Khối'],
      class_name: row['Lớp'],
      password: row.processedPassword,
    }));

    const result = await importStudents(validRows);
    setImportResult(result);
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
          <h1 className="text-28 font-bold">Import học sinh</h1>
        </div>

        <Card>
          <div className="text-center py-8">
            <div className="text-success text-5xl mb-4">✓</div>
            <h2 className="text-xl font-bold mb-2">Import thành công!</h2>
            <p className="text-textSecondary mb-6">
              Đã import <strong>{importResult.success}</strong> học sinh thành công
              {importResult.errors > 0 && (
                <span className="text-crimson"> ({importResult.errors} dòng lỗi)</span>
              )}
            </p>
            <Button variant="primary" onClick={() => router.push('/admin/students')}>
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
        <h1 className="text-28 font-bold">Import học sinh</h1>
        <Button variant="secondary" className="w-auto" onClick={() => router.push('/admin/students')}>
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
              Tải file mẫu Excel để điền thông tin học sinh theo đúng định dạng
            </p>
            <Button variant="primary" onClick={downloadTemplate}>
              Tải file mẫu (.xlsx)
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-semibold mb-2">Cấu trúc file mẫu:</h3>
            <div className="text-sm text-textSecondary">
              <p><strong>Tên đăng nhập:</strong> Tên đăng nhập (duy nhất)</p>
              <p><strong>Mật khẩu:</strong> Mật khẩu (để trống → mặc định: Haiphong@2026)</p>
              <p><strong>Họ tên:</strong> Họ và tên đầy đủ</p>
              <p><strong>Ngày sinh:</strong> Ngày sinh (DD/MM/YYYY)</p>
              <p><strong>Giới tính:</strong> Giới tính (Nam / Nữ / Khác)</p>
              <p><strong>Khối:</strong> Khối (10 / 11 / 12)</p>
              <p><strong>Lớp:</strong> Tên lớp (VD: 10A1)</p>
            </div>
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
              Chọn file Excel (.xlsx, .xls) hoặc CSV đã điền thông tin học sinh
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Tên đăng nhập</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Họ tên</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Ngày sinh</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Giới tính</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-textSecondary">Khối</th>
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
                      <td className="py-3 px-4 text-sm">{row['Tên đăng nhập']}</td>
                      <td className="py-3 px-4 text-sm">{row['Họ tên']}</td>
                      <td className="py-3 px-4 text-sm">{row['Ngày sinh']}</td>
                      <td className="py-3 px-4 text-sm">{row['Giới tính']}</td>
                      <td className="py-3 px-4 text-sm">{row['Khối']}</td>
                      <td className="py-3 px-4 text-sm">{row['Lớp']}</td>
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