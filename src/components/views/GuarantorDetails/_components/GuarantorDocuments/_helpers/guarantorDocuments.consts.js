import { Signal } from '@fyclabs/tools-fyc-react/signals';

// Signal for accept invitation form data
export const $guarantorDocumentsView = Signal({
  isTableLoading: false,
  showDeleteModal: false,
});

export const $guarantorDocumentsDetails = Signal({
  list: [],
  totalCount: 0,
  selectedDocument: null,
});

export const $guarantorDocumentsFilter = Signal({
  page: 1,
  sortKey: undefined,
  sortDirection: undefined,
});

export const TABLE_HEADERS = [
  { key: 'fileName', value: 'Document Name', sortKey: 'document_name' },
  { key: 'documentType', value: 'Document Type' },
  { key: 'uploadedAt', value: 'Upload Date', sortKey: 'uploaded_at' },
  { key: 'fileSize', value: 'File Size' },
  { key: 'actions', value: 'Actions' },
];

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
