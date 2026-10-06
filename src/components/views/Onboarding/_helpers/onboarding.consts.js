import { Signal } from '@fyclabs/tools-fyc-react/signals';

export const ONBOARDING_ORG_DB_STORAGE_KEY = 'onboardingSelectedOrgDb';

export const $onboardingView = Signal({
  isTableLoading: false,
  selectedRunId: null,
  showCreateModal: false,
  showUploadModal: false,
  showMatchModal: false,
  selectedItemId: null,
});

export const $onboardingTenants = Signal([]);
export const $onboardingSelectedTenant = Signal({ orgDb: null, displayName: null });
export const $onboardingTenantPick = Signal({ orgDb: '' });

export const $onboardingRuns = Signal({ list: [] });

export const $onboardingRunDetail = Signal({
  run: null,
  items: [],
  isLoading: false,
});

export const $onboardingCreateForm = Signal({
  name: '',
  dropboxFolderName: '',
  masterListFile: null,
});

export const $onboardingUploadState = Signal({
  files: [],
  progress: 0,
  isUploading: false,
});

export const ONBOARDING_DIFF_POLL_MS = 3000;
export const ONBOARDING_DIFF_POLL_TIMEOUT_MS = 180000;

export const $onboardingDiff = Signal({
  isInFlight: false,
  intervalId: null,
  generation: 0,
  activeRunId: null,
  resultClaimed: false,
});

export const $onboardingMatchForm = Signal({
  borrowerId: null,
  loanId: null,
  folders: [],
  selectedFolderPath: '',
  candidates: [],
  selectedBorrowerName: null,
});

export const $onboardingFiles = Signal({
  list: [],
  documentTypeOptions: [],
  loadedRunId: null,
});

export const $onboardingFileDrafts = Signal({});

export const $onboardingFileView = Signal({
  isTableLoading: true,
  hasLoaded: false,
  savingFileId: null,
  dirtyFileIds: {},
});

export const RUN_TABLE_HEADERS = [
  { key: 'name', value: 'Run name' },
  { key: 'status', value: 'Status' },
  { key: 'totalItems', value: 'CSV rows' },
  { key: 'matchedItems', value: 'Matched' },
  { key: 'importedItems', value: 'Imported' },
  { key: 'actions', value: 'Actions' },
];

export const ITEM_TABLE_HEADERS = [
  { key: 'borrowerName', value: 'Borrower' },
  { key: 'loanNumber', value: 'Loan #' },
  { key: 'folderPath', value: 'Folder' },
  { key: 'matchStatus', value: 'Match' },
  { key: 'importStatus', value: 'Import' },
  { key: 'actions', value: 'Actions' },
];

export const MATCH_STATUS_BADGE = {
  UNMATCHED: 'secondary',
  NEEDS_REVIEW: 'warning',
  AUTO_MATCHED: 'info',
  CONFIRMED: 'success',
  IGNORED: 'secondary',
};

export const FILE_TABLE_HEADERS = [
  { key: 'fileName', value: 'File name' },
  { key: 'folder', value: 'Folder' },
  { key: 'borrowerName', value: 'Borrower' },
  { key: 'documentType', value: 'Document type' },
  { key: 'confidence', value: 'Confidence' },
  { key: 'diffStatus', value: 'Diff status' },
  { key: 'geminiScan', value: 'Gemini scan' },
];

export const DIFF_STATUS_BADGE = {
  NEW: 'info',
  ALREADY_IMPORTED: 'success',
  EXTRA: 'warning',
  MISSING: 'secondary',
};

export const GEMINI_SCAN_STATUS_BADGE = {
  none: 'secondary',
  queued: 'info',
  running: 'warning',
  completed: 'success',
  failed: 'danger',
};
