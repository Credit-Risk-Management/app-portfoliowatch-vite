export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'Financial Statement', label: 'Financial Statement' },
  { value: 'Tax Return', label: 'Tax Return' },
  { value: 'Legal Document', label: 'Legal Document' },
  { value: 'Collateral Document', label: 'Collateral Document' },
  { value: 'Other', label: 'Other' },
];

export const TABLE_HEADERS = [
  { key: 'documentName', value: 'Document Name', sortKey: 'document_name' },
  { key: 'loanNumber', value: 'Loan Number' },
  { key: 'uploadedAt', value: 'Upload Date', sortKey: 'uploaded_at' },
  { key: 'fileSize', value: 'File Size' },
  { key: 'actions', value: 'Actions' },
];
