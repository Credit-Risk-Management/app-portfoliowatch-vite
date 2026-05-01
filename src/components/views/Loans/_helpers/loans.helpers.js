import { $borrowers } from '@src/signals';

/**
 * Finds and returns a client/borrower by ID
 */
export const getClientById = (clientId) => ($borrowers.value?.list || []).find((client) => client.id === clientId) || null;

/**
 * Formats a numeric ratio value to 2 decimal places
 */
export const formatRatio = (value) => {
  if (value === null || value === undefined) return '-';
  return Number(value).toFixed(2);
};

/**
 * Formats a date string to US locale format (MM/DD/YYYY)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

/**
 * Returns relationship manager options for dropdown
 */
export const getRelationshipManagerOptions = (managers) => managers.map((m) => ({
  value: m.id,
  label: m.name || m.relationshipManager?.name || 'Unknown',
}));

export const formatBorrowerPickerLine = (c) => {
  const name = (c.name || '').trim() || 'Unnamed borrower';
  const extId = c.borrowerId != null && String(c.borrowerId).trim() !== ''
    ? String(c.borrowerId).trim()
    : null;
  return extId ? `${name} (${extId})` : name;
};

/**
 * Async-select options; includes `borrower` for onChange without a local list.
 */
export const mapBorrowersToPickerOptions = (borrowers) => (borrowers || []).map((c) => ({
  value: c.id,
  label: formatBorrowerPickerLine(c),
  borrower: c,
}));

/**
 * Controlled value for react-select when only form fields are known.
 */
export const borrowerPickerValueFromForm = (borrowerId, borrowerName) => {
  if (borrowerId == null || borrowerId === '') return null;
  const label = (borrowerName || '').trim() || 'Selected borrower';
  return { value: borrowerId, label };
};

/**
 * Syncs borrowerId / borrowerName when user picks or clears the borrower picker.
 */
export const handleBorrowerSelectChange = (option, updateForm) => {
  if (!option?.value) {
    updateForm({ borrowerId: null, borrowerName: '' });
    return;
  }
  const name = (option.borrower?.name || '').trim()
    || (option.label || '').replace(/\s*\([^)]*\)\s*$/, '').trim()
    || '';
  updateForm({
    borrowerId: option.value,
    borrowerName: name,
  });
};

/** Decimal places for all interest rate displays and inputs (e.g. 5.125%). */
export const INTEREST_RATE_DECIMALS = 3;

/**
 * Formats a percentage value (general-purpose; default 2 decimals).
 */
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toFixed(2)}%`;
};

/**
 * Formats an interest rate as a percentage with {@link INTEREST_RATE_DECIMALS} places.
 */
export const formatInterestRatePercent = (value) => formatPercent(value, INTEREST_RATE_DECIMALS);

/**
 * Returns the label for a risk rating
 */
export const getRiskRatingLabel = (rating, labels) => labels[rating] || rating;

/**
 * Formats a percentage value (alias for formatPercentage, but handles empty strings)
 * @param {number} decimals - Number of decimal places (default 2; use {@link INTEREST_RATE_DECIMALS} for interest rates)
 */
export const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return `${num.toFixed(decimals)}%`;
};

/**
 * Calculate covenant status and return variant for color coding
 * All covenants: higher actual is better (actual should be >= covenant)
 */
export const getCovenantStatus = (actual, covenant) => {
  if (!actual || !covenant) return { variant: 'secondary', status: 'N/A', percentage: null };

  const percentage = (actual / covenant) * 100;

  if (actual >= covenant) {
    return { variant: 'success', status: 'Meeting', percentage };
  } if (percentage >= 90) {
    return { variant: 'warning', status: 'Warning', percentage };
  }
  return { variant: 'danger', status: 'Below', percentage };
};

/**
 * Get health score color class based on score value
 */
export const getHealthScoreColor = (score) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-danger';
};

/**
 * Convert markdown links to HTML anchor tags
 */
export const renderMarkdownLinks = (text) => {
  if (!text) return '';
  // Replace [text](url) with <a> tags
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
};

const latestGuarantorFinancialForLoanDetail = (financials) => {
  if (!Array.isArray(financials) || financials.length === 0) return null;
  return [...financials].sort(
    (a, b) => new Date(b.asOfDate || 0) - new Date(a.asOfDate || 0),
  )[0];
};

/**
 * Annual dollar debt service from latest borrower debt worksheet (matches BorrowerDebtServiceTab).
 * @param {null|{ totalMonthlyPayment?: number|string|null }} row
 */
export const annualDebtServiceFromWorksheetRow = (row) => {
  if (!row || row.totalMonthlyPayment == null || row.totalMonthlyPayment === '') return null;
  const m = Number(row.totalMonthlyPayment);
  if (!Number.isFinite(m)) return null;
  return Math.floor(m) * 12;
};

const sumLoanGuarantorsLatestField = (guarantors, field) => {
  if (!Array.isArray(guarantors)) return null;
  let sum = 0;
  let has = false;
  guarantors.forEach((g) => {
    const snap = latestGuarantorFinancialForLoanDetail(g.financials);
    if (!snap || snap[field] == null || snap[field] === '') return;
    const n = Number(snap[field]);
    if (!Number.isFinite(n)) return;
    has = true;
    sum += n;
  });
  return has ? sum : null;
};

/**
 * Global cash flow: business EBITDA + personal AGI vs business + personal debt service;
 * global DSCR = combined income ÷ combined debt service; excess = income − combined debt service.
 */
export const computeLoanGlobalCashFlowAnalysis = ({
  borrowerEbitda,
  latestDebtScheduleRow,
  loanGuarantors,
}) => {
  const businessEbitda = borrowerEbitda != null && borrowerEbitda !== ''
    ? Number(borrowerEbitda)
    : null;
  const bizEbitdaFin = Number.isFinite(businessEbitda) ? businessEbitda : null;

  const businessDebtServiceAnnual = annualDebtServiceFromWorksheetRow(latestDebtScheduleRow ?? null);

  const personalAgi = sumLoanGuarantorsLatestField(loanGuarantors, 'adjustedGrossIncome');
  const personalDebtServiceAnnual = sumLoanGuarantorsLatestField(loanGuarantors, 'annualDebtService');

  const hasIncomePiece = bizEbitdaFin != null || personalAgi != null;
  const combinedIncome = hasIncomePiece
    ? (bizEbitdaFin ?? 0) + (personalAgi ?? 0)
    : null;

  const hasDebtPiece = businessDebtServiceAnnual != null || personalDebtServiceAnnual != null;
  const combinedDebtService = hasDebtPiece
    ? (businessDebtServiceAnnual ?? 0) + (personalDebtServiceAnnual ?? 0)
    : null;

  let globalDebtServiceCoverageRatio = null;
  if (
    combinedDebtService != null
    && combinedDebtService > 0
    && combinedIncome != null
  ) {
    globalDebtServiceCoverageRatio = combinedIncome / combinedDebtService;
  }

  let excessCashFlow = null;
  if (combinedIncome != null && combinedDebtService != null) {
    excessCashFlow = combinedIncome - combinedDebtService;
  }

  return {
    businessEbitda: bizEbitdaFin,
    businessDebtServiceAnnual,
    personalAgi,
    personalDebtServiceAnnual,
    globalDebtServiceCoverageRatio,
    excessCashFlow,
  };
};
