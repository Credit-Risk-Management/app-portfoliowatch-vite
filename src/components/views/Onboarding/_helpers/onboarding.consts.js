import { Signal } from '@fyclabs/tools-fyc-react/signals';

export const ONBOARDING_ORG_DB_STORAGE_KEY = 'onboardingSelectedOrgDb';

export const $onboardingView = Signal({
  isTableLoading: true,
  isCreating: false,
  isImporting: false,
  isLoadingMatch: false,
  isSavingMatch: false,
  matchSaveAction: null,
  confirmingMatchItemId: null,
  selectedRunId: null,
  showCreateModal: false,
  showUploadModal: false,
  showMatchModal: false,
  showFolderFilesModal: false,
  selectedItemId: null,
  folderFilesItemId: null,
  folderFilesPath: null,
});

export const $onboardingTenants = Signal([]);
export const $onboardingSelectedTenant = Signal({ orgDb: null, displayName: null });
export const $onboardingTenantPick = Signal({ orgDb: '' });

export const $onboardingRuns = Signal({ list: [] });

export const $onboardingRunDetail = Signal({
  run: null,
  items: [],
  isLoading: true,
});

export const $onboardingCreateForm = Signal({
  name: '',
  dropboxFolderName: '',
  masterListFile: null,
  autoContinue: false,
  autoScanAfterImport: false,
});

export const $onboardingRunSummary = Signal({
  data: null,
  isLoading: false,
});

export const ONBOARDING_SUMMARY_POLL_MS = 3000;

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

export const $onboardingItemFilter = Signal({
  page: 1,
  limit: 10,
  searchTerm: '',
  matchStatus: '',
  importStatus: '',
  needsAttentionOnly: true,
});

export const ONBOARDING_MATCH_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All match statuses' },
  { value: 'UNMATCHED', label: 'Unmatched' },
  { value: 'NEEDS_REVIEW', label: 'Needs review' },
  { value: 'AUTO_MATCHED', label: 'Auto matched' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'IGNORED', label: 'Ignored' },
];

export const ONBOARDING_IMPORT_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All import statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RUNNING', label: 'Running' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'SKIPPED', label: 'Skipped' },
];

export const $onboardingFileFilter = Signal({
  page: 1,
  limit: 10,
});

export const $onboardingFolderFileFilter = Signal({
  page: 1,
  limit: 10,
});

export const ONBOARDING_IMPORT_POLL_MS = 3000;
export const ONBOARDING_IMPORT_POLL_TIMEOUT_MS = 600000;

export const $onboardingImport = Signal({
  isPolling: false,
  intervalId: null,
  generation: 0,
  activeRunId: null,
  autoScanClaimed: false,
  resultClaimed: false,
});

export const ONBOARDING_SCAN_POLL_MS = 3000;
export const ONBOARDING_SCAN_POLL_TIMEOUT_MS = 600000;

export const $onboardingScan = Signal({
  isInFlight: false,
  intervalId: null,
  generation: 0,
  activeRunId: null,
});

export const $onboardingFileView = Signal({
  isTableLoading: true,
  hasLoaded: false,
  savingFileId: null,
  dirtyFileIds: {},
  selectedItems: [],
  isSelectAllChecked: false,
});

export const $onboardingFolderFileView = Signal({
  selectedItems: [],
  isSelectAllChecked: false,
});

export const RUN_TABLE_HEADERS = [
  { key: 'name', value: 'Run name' },
  { key: 'status', value: 'Status' },
  { key: 'totalItems', value: 'CSV rows' },
  { key: 'matchedItems', value: 'Matched' },
  { key: 'importedItems', value: 'Imported' },
  { key: 'exceptionsCount', value: 'Exceptions' },
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

/** Utility classes only — react-bootstrap `bg` prop does not support custom color tokens. */
export const ONBOARDING_BADGE_CLASS = 'bg-secondary-100 text-secondary-900';

export const RUN_STATUS_BADGE = {
  DRAFT: ONBOARDING_BADGE_CLASS,
  UPLOADING: 'bg-info-400 text-info-900',
  DIFFING: 'bg-warning-500 text-warning-900',
  CLASSIFYING: 'bg-warning-500 text-warning-900',
  READY_FOR_REVIEW: 'bg-info-400 text-info-900',
  IMPORTING: 'bg-info-400 text-info-900',
  COMPLETED: 'bg-success-500 text-dark',
  FAILED: 'bg-danger-500 text-dark',
};

export const MATCH_STATUS_BADGE = {
  UNMATCHED: ONBOARDING_BADGE_CLASS,
  NEEDS_REVIEW: 'bg-warning-500 text-warning-900',
  AUTO_MATCHED: 'bg-info-400 text-info-900',
  CONFIRMED: 'bg-success-500 text-dark',
  IGNORED: ONBOARDING_BADGE_CLASS,
};

export const IMPORT_STATUS_BADGE = {
  PENDING: ONBOARDING_BADGE_CLASS,
  RUNNING: 'bg-info-400 text-info-900',
  COMPLETED: 'bg-success-500 text-dark',
  FAILED: 'bg-danger-500 text-dark',
  SKIPPED: ONBOARDING_BADGE_CLASS,
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
  NEW: 'bg-info-400 text-info-900',
  ALREADY_IMPORTED: 'bg-success-500 text-dark',
  EXTRA: 'bg-warning-500 text-warning-900',
  MISSING: ONBOARDING_BADGE_CLASS,
};

export const GEMINI_SCAN_STATUS_BADGE = {
  none: ONBOARDING_BADGE_CLASS,
  queued: 'bg-info-400 text-info-900',
  running: 'bg-warning-500 text-warning-900',
  completed: 'bg-success-500 text-dark',
  failed: 'bg-danger-500 text-dark',
};
