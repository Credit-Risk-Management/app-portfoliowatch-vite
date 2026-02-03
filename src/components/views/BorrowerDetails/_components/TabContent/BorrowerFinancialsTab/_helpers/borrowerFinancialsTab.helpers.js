import * as consts from './borrowerFinancialsTab.consts';

export const FINANCIALS_TABLE_HEADERS = [
  { key: 'asOfDate', value: 'As Of Date', sortKey: 'asOfDate' },
  { key: 'submittedAt', value: 'Submitted Date', sortKey: 'submittedAt' },
  { key: 'accountabilityScore', value: 'Accountability Score', sortKey: 'accountabilityScore' },
  { key: 'grossRevenue', value: 'Gross Revenue', sortKey: 'grossRevenue' },
  { key: 'netIncome', value: 'Net Income', sortKey: 'netIncome' },
  { key: 'ebitda', value: 'EBITDA', sortKey: 'ebitda' },
  { key: 'debtService', value: 'DSCR', sortKey: 'debtService' },
  { key: 'currentRatio', value: 'Current Ratio', sortKey: 'currentRatio' },
  { key: 'liquidity', value: 'Liquidity', sortKey: 'liquidity' },
  { key: 'submittedBy', value: 'Submitted By', sortKey: 'submittedBy' },
  { key: 'documents', value: 'Documents' },
];

export const formatFinancialDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Build upload link URL from permanent link token (for copy button).
 */
export const getUploadLinkUrl = () => {
  const token = consts.$permanentUploadLink.value?.token;
  if (!token) return null;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/upload-financials/${token}`;
};
