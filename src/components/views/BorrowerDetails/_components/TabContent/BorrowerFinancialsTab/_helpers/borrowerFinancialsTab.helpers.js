import { formatDate } from '@src/utils/formatDate';
import * as consts from './borrowerFinancialsTab.consts';

/** Document type values and labels for financial documents (camelCase + snake_case for API compatibility) */
export const FINANCIAL_DOC_TYPES = [
  { value: 'personalFinancialStatement', label: 'Personal Financial Statement' },
  { value: 'personal_financial_statement', label: 'Personal Financial Statement' },
  { value: 'incomeStatement', label: 'Income Statement' },
  { value: 'income_statement', label: 'Income Statement' },
  { value: 'balanceSheet', label: 'Balance Sheet' },
  { value: 'balance_sheet', label: 'Balance Sheet' },
  { value: 'debtServiceWorksheet', label: 'Debt Schedule' },
  { value: 'debt_service_worksheet', label: 'Debt Schedule' },
  { value: 'taxReturn', label: 'Tax Return' },
  { value: 'tax_return', label: 'Tax Return' },
];

export const FINANCIALS_TABLE_HEADERS = [
  { key: 'asOfDate', value: 'As Of Date', sortKey: 'asOfDate' },
  { key: 'submittedAt', value: 'Submitted Date', sortKey: 'submittedAt' },
  { key: 'docTypes', value: 'Document Types', sortKey: 'docTypes' },
  { key: 'accountabilityScore', value: 'Accountability Score', sortKey: 'accountabilityScore' },
  { key: 'grossRevenue', value: 'Gross Revenue', sortKey: 'grossRevenue' },
  { key: 'netIncome', value: 'Net Income', sortKey: 'netIncome' },
  { key: 'ebitda', value: 'EBITDA', sortKey: 'ebitda' },
  { key: 'debtService', value: 'Debt Service', sortKey: 'debtService' },
  { key: 'currentRatio', value: 'Current Ratio', sortKey: 'currentRatio' },
  { key: 'liquidity', value: 'Liquidity', sortKey: 'liquidity' },
  { key: 'submittedBy', value: 'Submitted By', sortKey: 'submittedBy' },
  { key: 'documents', value: 'Documents' },
];

export const formatFinancialDate = formatDate;

/**
 * Build upload link URL from permanent link token (for copy button).
 */
export const getUploadLinkUrl = () => {
  const token = consts.$permanentUploadLink.value?.token;
  if (!token) return null;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/upload-financials/${token}`;
};
