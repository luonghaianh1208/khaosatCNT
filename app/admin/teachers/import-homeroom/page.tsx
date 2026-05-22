'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { importHomeroom } from '@/app/admin/actions';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import * as XLSX from 'xlsx';

interface HomeroomRow {
  'Lớp': string;
  'Họ tên GVCN': string;
}

interface ValidatedRow extends HomeroomRow {
  isValid: boolean;
  errors: string[];
}

function validateRow(row: HomeroomRow): ValidatedRow {
  const errors: string[] = [];
  if (!row['Lớp'] || row['Lớp'].trim() === '') errors.push('Lớp không được để trống');
  if (!row['Họ tên GVCN'] || row['Họ tên GVCN'].trim() === '') errors.push('Họ tên GVCN không được để trống');
  return { ...row, 'Lớp': row['Lớp']?.trim() || '', 'Họ tên GVCN': row['Họ tên GVCN']?.trim() || '', isValid: errors.length === 0, errors };
}

export default function ImportHomeroomPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [parsedData, setParsedData] = useState<ValidatedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: number; message?: string | null; noSession?: boolean } | null>(null);

  const validCount = parsedData.filter((r) => r.isValid).length;
  const errorCount = parsedData.filter((r) => !r.isValid).length;

  const downloadTemplate = () => {
    const data = [
      { 'Lớp': '10A1', 'Họ tên GVCN': 'Nguyễn Thị A' },
      { 'Lớp': '10A2', 'Họ tên GVCN': 'Trần Văn B' },
      { 'Lớp': '11A1', 'Họ tên GVCN': 'Lê Thị C' },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 12 }, { wch: 25 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'GVCN');
    XLSX.writeFile(wb, 'Mau_Import_GVCN.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

      const validated = jsonData.map((row) => {
        const normalized = Object.fromEntries(
          Object.entries(row).map(([k, v]) => [k, String(v ?? '')])
        ) as unknown as HomeroomRow;
        return validateRow(normalized);
      });

      setParsedData(validated);
      setStep(3);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleImport = async () => {
    setImporting(true);
    const validRows = parsedData.filter((r) => r.isValid).map((r) => ({
      class_name: r['Lớp'],
      full_name: r['Họ tên GVCN'],
    }));
    const result = await importHomeroom(validRows);
    setImportResult({ success: result.success, errors: validRows.length - result.success, message: result.message ?? null, noSession: result.noSession });
    setImporting(false);
  };

  const handleReset = () => {
    setStep(1);
    setParsedData([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (importResult) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-text-primary">Import GVCN</h1>
        </div>
        <Card>
          <div className="text-center py-8">
            <div className="text-success text-5xl mb-4">✓</div>
            <h2 className="text-xl font-bold mb-2">Import thành công!</h2>
            <p className="text-text-secondary mb-2">
              Đã import <strong>{importResult.success}</strong> GVCN thành công
              {importResult.errors > 0 && <span className="text-crimson"> ({importResult.errors} dòng lỗi)</span>}
            </p>
            {importResult.noSession && (
              <p className="text-xs text-warning mb-4 bg-warning/5 border border-warning/20 rounded-xl px-4 py-2 max-w-md mx-auto">
                Chưa có đợt khảo sát đang hoạt động — GVCN đã được tạo nhưng chưa phân công lớp. Bật đợt khảo sát để tự động phân công.
              </p>
            )}
            {importResult.message && !importResult.noSession && (
              <p className="text-xs text-crimson mb-4 bg-crimson/5 border border-crimson/20 rounded-xl px-4 py-2 max-w-md mx-auto">
                {importResult.message}
              </p>
            )}
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
        <h1 className="text-xl font-bold text-text-primary">Import GVCN</h1>
        <Button variant="secondary" className="w-auto" onClick={() => router.push('/admin/teachers')}>
          ← Quay về
        </Button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-6">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="flex items-center gap-4">
            {i > 0 && <div className="w-8 h-px bg-border" />}
            <div className={`flex items-center gap-2 ${step >= s ? 'text-primary' : 'text-text-secondary'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= s ? 'bg-primary text-white' : 'bg-border text-text-secondary'}`}>{s}</span>
              <span className="text-sm font-medium">{['Tải file mẫu', 'Upload file', 'Xem trước & xác nhận'][i]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <Card>
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📄</div>
            <h2 className="text-xl font-bold mb-2">Tải file mẫu GVCN</h2>
            <p className="text-text-secondary mb-6">File chỉ gồm 2 cột: Lớp và Họ tên GVCN</p>
            <Button variant="primary" onClick={downloadTemplate}>Tải file mẫu (.xlsx)</Button>
          </div>
          <div className="mt-6 pt-6 border-t border-border text-sm text-text-secondary space-y-1">
            <p><strong>Lớp:</strong> Tên lớp (phải khớp với lớp của học sinh)</p>
            <p><strong>Họ tên GVCN:</strong> Họ và tên đầy đủ</p>
            <p className="text-text-muted mt-2">Mỗi dòng = 1 lớp. Mỗi lớp chỉ có 1 GVCN.</p>
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={() => setStep(2)}>Đã có file → Tiếp tục</Button>
          </div>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <Card>
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📤</div>
            <h2 className="text-xl font-bold mb-2">Upload file GVCN</h2>
            <p className="text-text-secondary mb-6">Chọn file Excel (.xlsx, .xls) hoặc CSV</p>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
            <Button variant="primary" onClick={() => fileInputRef.current?.click()}>Chọn file...</Button>
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="secondary" onClick={() => setStep(1)}>← Quay lại</Button>
          </div>
        </Card>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <>
          <div className="flex gap-4 mb-4">
            <Badge variant="success">{validCount} dòng hợp lệ</Badge>
            {errorCount > 0 && <Badge variant="danger">{errorCount} dòng lỗi</Badge>}
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary w-12">#</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Trạng thái</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Lớp</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Họ tên GVCN</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Lỗi</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row, index) => (
                    <tr key={index} className={`border-b border-border ${row.isValid ? 'bg-success/5' : 'bg-crimson/5'}`}>
                      <td className="py-3 px-4 text-sm">{index + 1}</td>
                      <td className="py-3 px-4">
                        {row.isValid ? <span className="text-success text-lg">✓</span> : <span className="text-crimson text-lg">✗</span>}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">{row['Lớp']}</td>
                      <td className="py-3 px-4 text-sm">{row['Họ tên GVCN']}</td>
                      <td className="py-3 px-4 text-sm text-crimson">{row.errors.length > 0 ? row.errors.join('; ') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="secondary" onClick={handleReset}>Chọn file khác</Button>
              <Button variant="primary" disabled={validCount === 0 || importing} onClick={handleImport}>
                {importing ? 'Đang import...' : 'Xác nhận import'}
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
