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

export const GUARANTOR_DOCUMENTS_TABLE_HEADERS = [
  { key: 'fileName', value: 'Document Name', sortKey: 'document_name' },
  { key: 'documentType', value: 'Document Type' },
  { key: 'uploadedAt', value: 'Upload Date', sortKey: 'uploaded_at' },
  { key: 'fileSize', value: 'File Size' },
  { key: 'actions', value: 'Actions' },
];
