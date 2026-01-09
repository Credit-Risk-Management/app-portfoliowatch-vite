import { Signal } from '@fyclabs/tools-fyc-react/signals';

// Signal for credit memo view state (modal visibility, current loan)
export const $creditMemoView = Signal({
  showModal: false,
  currentLoanId: null,
});

// Signal for credit memo form data
export const $creditMemoForm = Signal({
  asOfDate: '',
  debtService: '',
  currentRatio: '',
  liquidity: '',
  liquidityRatio: '',
  notes: '',
});

// Signal for file uploader
export const $creditMemoDocsUploader = Signal({
  creditMemoDocs: [],
});

// Signal for modal state
export const $creditMemoModalState = Signal({
  ocrApplied: false,
  isSubmitting: false,
  error: null,
  pdfUrl: null,
  uploadedDocument: null,
  refreshKey: 0, // Used to force component re-render
});

