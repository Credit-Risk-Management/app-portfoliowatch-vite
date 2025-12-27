import { Signal } from '@fyclabs/tools-fyc-react/signals';

// Signal for public financial upload form data
export const $publicFinancialForm = Signal({
  asOfDate: '',
  grossRevenue: '',
  netIncome: '',
  ebitda: '',
  debtService: '',
  debtServiceCovenant: '',
  currentRatio: '',
  currentRatioCovenant: '',
  liquidity: '',
  liquidityCovenant: '',
  liquidityRatio: '',
  liquidityRatioCovenant: '',
  retainedEarnings: '',
  notes: '',
});

// Signal for file uploader
export const $financialDocsUploader = Signal({
  financialDocs: [],
});

// Signal for component view state
export const $publicFinancialUploadView = Signal({
  linkData: null,
  isLoading: true,
  isSubmitting: false,
  error: null,
  success: false,
  ocrApplied: false,
  refreshKey: 0,
});
