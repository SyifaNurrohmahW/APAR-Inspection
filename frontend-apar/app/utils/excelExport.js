import * as XLSX from 'xlsx';

/**
 * Utility untuk export data ke file Excel (.xlsx)
 * @param {Array<Object>} data Array dari object data
 * @param {string} fileName Nama file output (tanpa ekstensi .xlsx)
 * @param {string} sheetName Nama sheet Excel (default: 'Data')
 */
export const exportToExcel = (data, fileName = 'export_data', sheetName = 'Data') => {
  if (!data || !data.length) {
    alert('Tidak ada data untuk diekspor ke Excel');
    return;
  }

  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Auto calculate column width
    const objectKeys = Object.keys(data[0]);
    const colWidths = objectKeys.map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.map((row) => (row[key] ? String(row[key]).length : 0))
      );
      return { wch: Math.min(Math.max(maxLength + 3, 10), 40) };
    });
    worksheet['!cols'] = colWidths;

    // Generate filename with timestamp
    const dateStr = new Date().toISOString().split('T')[0];
    const finalFileName = `${fileName}_${dateStr}.xlsx`;

    XLSX.writeFile(workbook, finalFileName);
  } catch (error) {
    console.error('Terjadi kesalahan saat mengunduh Excel:', error);
    alert('Gagal mengekspor file Excel. Silakan coba lagi.');
  }
};
