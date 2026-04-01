import { Badge } from 'react-bootstrap';
import { formatCurrency } from '@src/utils/formatCurrency';

/**
 * Source of truth: `notes` on GuarantorFinancial.
 * True when values were sourced from a lender/credit memo (not a submitted PFS), e.g. Sensible extraction:
 * "Extracted from lender memo via Sensible on 2026-03-12 || ..."
 */
export const isNetWorthFromCreditMemoNotes = (notes) => {
  if (notes == null || typeof notes !== 'string') return false;
  const n = notes.trim().toLowerCase();
  if (!n) return false;
  return (
    n.includes('lender memo')
    || n.includes('credit memo')
    || n.includes('credit-memo')
  );
};

export const getLatestGuarantorFinancial = (financials) => {
  if (!Array.isArray(financials) || financials.length === 0) return null;
  return [...financials].sort((a, b) => new Date(b.asOfDate) - new Date(a.asOfDate))[0];
};

const formatNetWorthDisplay = (netWorth) => {
  if (netWorth === null || netWorth === undefined || netWorth === '') return 'N/A';
  return formatCurrency(netWorth);
};

/**
 * Net worth with optional badge when notes indicate values were sourced from lender memo / credit memo (not PFS).
 * @param {boolean} compact — table cells: smaller amount styling
 */
export function GuarantorNetWorthWithMemoFlag({ netWorth, notes, className = '', compact = false }) {
  const fromLenderMemo = isNetWorthFromCreditMemoNotes(notes);
  const amountClass = compact
    ? 'text-info-50 fw-500'
    : 'text-success-400 fw-600 fs-5';
  return (
    <span className={`d-inline-flex align-items-center flex-wrap gap-8 ${className}`.trim()}>
      <span className={amountClass}>{formatNetWorthDisplay(netWorth)}</span>
      {fromLenderMemo && (
        <Badge bg="secondary-100" className="text-secondary-900 fw-normal text-wrap text-start">
          From credit memo
        </Badge>
      )}
    </span>
  );
}

export default GuarantorNetWorthWithMemoFlag;
