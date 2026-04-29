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

/** True if any local file is staged and still needs upload + Sensible (Submit Financials modal). */
export const hasPendingExtraction = (documentsByType) => {
  if (!documentsByType) return false;
  return Object.values(documentsByType).some(
    (docs) => (docs || []).some((d) => d.extractionPending && d.file),
  );
};

/** True if at least one document is attached in any section (new financial upload list). */
export const hasAnyStagedDocument = (documentsByType) => {
  if (!documentsByType) return false;
  return Object.values(documentsByType).some((docs) => (docs || []).length > 0);
};
