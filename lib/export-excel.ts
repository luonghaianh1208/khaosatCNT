import * as XLSX from 'xlsx';

interface ExportSheet {
  headers: string[];
  rows: (string | number)[][];
  sheetName: string;
  title: string;
}

export async function exportToExcel(sheets: ExportSheet[], filename: string) {
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ headers, rows, sheetName, title }) => {
    const ws = XLSX.utils.aoa_to_sheet([[title], headers, ...rows]);

    // Style header row (row index 1, 0-indexed)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 1, c: col })];
      cell.s = {
        fill: { fgColor: { rgb: '00549B' } },
        font: { color: { rgb: 'FFFFFF' }, bold: true },
        alignment: { horizontal: 'center' },
        border: { style: 'thin', color: { rgb: 'DEE2E6' } },
      };
    }

    // Style data rows (alternating colors)
    for (let row = 2; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
        cell.s = {
          border: { style: 'thin', color: { rgb: 'DEE2E6' } },
          fill: { fgColor: { rgb: row % 2 === 0 ? 'F8F9FA' : 'FFFFFF' } },
        };
      }
    }

    // Set column widths
    ws['!cols'] = headers.map(() => ({ wch: 15 }));
    // Auto filter
    ws['!autofilter'] = { ref: `A2:${XLSX.utils.encode_cell({ r: range.e.r, c: range.e.c })}` };
    // Freeze row 1 (header) and row 2 (column names)
    ws['!freeze'] = { xSplit: 0, ySplit: 2 };

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, `${filename}.xlsx`);
}