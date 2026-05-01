export const isPdfFile = (doc) => {
  if (!doc) return false;
  const mimeType = doc.mimeType || '';
  const fileName = doc.fileName || '';
  // Check for PDF MIME type (with common variations) or file extension
  return mimeType === 'application/pdf'
    || mimeType === 'application/x-pdf'
    || mimeType === 'application/x-bzpdf'
    || mimeType === 'application/x-gzpdf'
    || fileName.match(/\.pdf$/i);
};

export const isExcelFile = (doc) => {
  if (!doc) return false;
  const mimeType = doc.mimeType || '';
  const fileName = doc.fileName || '';
  return mimeType.includes('spreadsheet')
    || fileName.match(/\.(xlsx?|xls)$/i)
    || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    || mimeType === 'application/vnd.ms-excel';
};

export const getFileIcon = (doc) => {
  if (!doc) return 'file';
  const mimeType = doc.mimeType || '';
  const fileName = doc.fileName || '';

  if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) return 'file-pdf';
  if (mimeType.includes('spreadsheet') || fileName.match(/\.(xlsx?|csv)$/i)) return 'file-excel';
  if (mimeType.includes('word') || fileName.match(/\.docx?$/i)) return 'file-word';
  return 'file';
};
