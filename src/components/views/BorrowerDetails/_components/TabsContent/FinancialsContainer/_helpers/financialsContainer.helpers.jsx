import { Badge } from 'react-bootstrap';
import { formatCurrency } from '@src/utils/formatCurrency';

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

export const buildFinancialsTableRows = (financialsList) => {
  if (!Array.isArray(financialsList)) return [];
  return financialsList.map((financial) => ({
    ...financial,
    asOfDate: formatFinancialDate(financial.asOfDate),
    submittedAt: formatFinancialDate(financial.submittedAt),
    accountabilityScore: financial.accountabilityScore || '-',
    grossRevenue: <span className="text-success-500 fw-500">{formatCurrency(financial.grossRevenue)}</span>,
    netIncome: <span className="text-success-500 fw-500">{formatCurrency(financial.netIncome)}</span>,
    ebitda: <span className="text-success-500 fw-500">{formatCurrency(financial.ebitda)}</span>,
    debtService: financial.debtService ? parseFloat(financial.debtService).toFixed(2) : '-',
    currentRatio: financial.currentRatio ? parseFloat(financial.currentRatio).toFixed(2) : '-',
    liquidity: <span className="text-success-500 fw-500">{formatCurrency(financial.liquidity)}</span>,
    submittedBy: financial.submittedBy || '-',
    documents: financial.documentIds && financial.documentIds.length > 0
      ? <Badge bg="info-100">{financial.documentIds.length} docs</Badge>
      : <span className="text-info-100">-</span>,
  }));
};
