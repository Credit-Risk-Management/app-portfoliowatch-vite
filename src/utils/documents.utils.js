import documentsApi from '@src/api/documents.api';
import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'Financial Statement', label: 'Financial Statement' },
  { value: 'Tax Return', label: 'Tax Return' },
  { value: 'Legal Document', label: 'Legal Document' },
  { value: 'Collateral Document', label: 'Collateral Document' },
  { value: 'Other', label: 'Other' },
];

export const DOCUMENTS_TABLE_HEADERS = [
  { key: 'documentName', value: 'Document Name', sortKey: 'document_name' },
  { key: 'loanNumber', value: 'Loan Number' },
  { key: 'uploadedAt', value: 'Upload Date', sortKey: 'uploaded_at' },
  { key: 'fileSize', value: 'File Size' },
  { key: 'actions', value: 'Actions' },
];

export const FINANCIAL_DOCUMENT_TYPE_LABELS = {
  personalTaxReturn: 'Personal Tax Return',
  personalFinancialStatement: 'Personal Financial Statement',
  taxReturn: 'Tax Return',
  balanceSheet: 'Balance Sheet',
  incomeStatement: 'Income Statement',
  debtServiceWorksheet: 'Debt Service Worksheet',
};

export const getLoanNumber = (loanId, loans = []) => {
  const loan = loans.find((l) => l.id === loanId);
  if (!loan) return '-';
  return loan.loanNumber || loan.loan_number || loan.loanId || '-';
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

export const formatUploadDate = (date) => {
  if (!date) return '-';

  const uploadDate = new Date(date);
  return uploadDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatFinancialDocumentType = (docType) => (
  FINANCIAL_DOCUMENT_TYPE_LABELS[docType] ?? docType
);

/** MIME → extension for financial uploads (public + lender submit). */
const MIME_TO_UPLOAD_EXT = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-excel': '.xls',
  'text/csv': '.csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
};

const UPLOAD_EXT_PATTERN = /\.(pdf|xlsx?|csv|docx?)$/i;

/**
 * Extension for a browser File — prefers the real file name, then MIME.
 * @param {File|null|undefined} file
 * @returns {string}
 */
export const extensionFromUploadFile = (file) => {
  if (!file) return '.pdf';
  const name = file.name || '';
  const nameExt = name.includes('.') ? name.slice(name.lastIndexOf('.')).toLowerCase() : '';
  if (nameExt && UPLOAD_EXT_PATTERN.test(nameExt)) return nameExt;
  const mimeExt = MIME_TO_UPLOAD_EXT[(file.type || '').split(';')[0].trim().toLowerCase()];
  return mimeExt || '.pdf';
};

/**
 * Locked upload name: `{entitySlug}-{documentType}-{YYYY-MM-DD}{ext}` (ext from the File).
 * @param {{ entityName?: string, documentType: string, date?: string|Date, file: File }} params
 */
export const buildStandardFinancialUploadFileName = ({
  entityName,
  documentType,
  date,
  file,
}) => {
  const safeName = (entityName || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const dateStr = (date ? new Date(date) : new Date()).toISOString().slice(0, 10);
  const ext = extensionFromUploadFile(file);
  return `${safeName}-${documentType}-${dateStr}${ext}`;
};

export const isPdfFile = (doc) => {
  if (!doc) return false;
  const mimeType = doc.mimeType || '';
  const fileName = doc.fileName || '';
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

export const hasPendingExtraction = (documentsByType) => {
  if (!documentsByType) return false;
  return Object.values(documentsByType).some(
    (docs) => (docs || []).some((d) => d.extractionPending && d.file),
  );
};

export const hasAnyStagedDocument = (documentsByType) => {
  if (!documentsByType) return false;
  return Object.values(documentsByType).some((docs) => (docs || []).length > 0);
};

export const triggerBrowserFileDownload = (url, fileName = 'document') => {
  if (!url) return;
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const handleDownloadDocument = async (documentId, fileName) => {
  try {
    const response = await documentsApi.getDownloadUrl(documentId);

    if (response.data && response.data.downloadUrl) {
      triggerBrowserFileDownload(response.data.downloadUrl, fileName || 'document');
      successAlert('Download started');
    } else {
      dangerAlert('Failed to get download URL');
    }
  } catch (error) {
    dangerAlert(error.message || 'Failed to download document');
  }
};
