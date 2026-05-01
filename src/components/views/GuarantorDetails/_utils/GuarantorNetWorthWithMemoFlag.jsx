import { Badge } from 'react-bootstrap';
import { formatCurrency } from '@src/utils/formatCurrency';
import { isNetWorthFromCreditMemoNotes } from './guarantorFinancialsSource.helpers';

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
