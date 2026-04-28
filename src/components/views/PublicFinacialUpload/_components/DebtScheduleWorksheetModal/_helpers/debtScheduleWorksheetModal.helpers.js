import {
  WORKSHEET_COL_ALIGN,
  WORKSHEET_WRAP_KEYS,
  CURRENT_OR_DELINQUENT_SELECT_OPTIONS,
  DEBT_SCHEDULE_CURRENCY_COLUMN_KEYS,
} from './debtScheduleWorksheetModal.consts';

export const getWorksheetColumnAlignClass = (colKey) => WORKSHEET_COL_ALIGN[colKey] ?? 'text-start';

/** Creditor & collateral: preview row vs in-place textarea (see DebtScheduleWrapCellField). */
export const worksheetCellTruncatesWhenBlurred = (colKey) => WORKSHEET_WRAP_KEYS.has(colKey);

/**
 * Live MM/DD/YYYY mask: digits only, max 8. Four-digit values with an impossible month (e.g. 2024) stay as year.
 */
export const formatDebtWorksheetMmDdYyyyInput = (rawInput) => {
  const d = String(rawInput ?? '').replace(/\D/g, '').slice(0, 8);
  if (!d) return '';
  if (d.length === 4) {
    const mm = Number(d.slice(0, 2));
    if (mm > 12) return d;
  }
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

/**
 * Currency-style typing for worksheet cells: commas, optional decimals (max 2), no $.
 */
export const formatDebtWorksheetCurrencyTyping = (rawInput) => {
  let s = String(rawInput ?? '').replace(/[$\s,]/g, '');
  s = s.replace(/[^\d.]/g, '');
  const dot = s.indexOf('.');
  if (dot !== -1) {
    s = `${s.slice(0, dot + 1)}${s.slice(dot + 1).replace(/\./g, '')}`;
  }
  const [wholeRaw = '', frac = ''] = s.split('.');
  const fracDigits = frac.replace(/\D/g, '').slice(0, 2);
  const wholeDigits = wholeRaw.replace(/\D/g, '');
  const endsWithDot = s.endsWith('.') && fracDigits.length === 0;

  if (!wholeDigits && !fracDigits && !endsWithDot) return '';

  const intKey = wholeDigits.replace(/^0+(?=\d)/, '') || '0';
  const intDisplay = Number(intKey).toLocaleString('en-US');

  if (endsWithDot) return `${intDisplay}.`;
  if (fracDigits.length > 0) return `${intDisplay}.${fracDigits}`;
  return intDisplay;
};

export const worksheetCellPlaceholder = (colKey, colIdx) => {
  if (colIdx === 0) return 'Creditor';
  if (colKey === 'maturityDate') return 'MM/DD/YYYY';
  return '—';
};

export const worksheetCellInputMode = (colKey) => {
  if (colKey === 'originalDateYear') return 'numeric';
  if (DEBT_SCHEDULE_CURRENCY_COLUMN_KEYS.has(colKey)) return 'currency';
  return undefined;
};

/** react-select `value` must be an option object or null (form stores string). */
export const getCurrentOrDelinquentSelectValue = (stored) => {
  const v = String(stored ?? '').trim();
  if (!v) return null;
  if (v.toLowerCase().includes('delinq')) {
    return CURRENT_OR_DELINQUENT_SELECT_OPTIONS.find((o) => o.value === 'Delinquent') ?? null;
  }
  return CURRENT_OR_DELINQUENT_SELECT_OPTIONS.find((o) => o.value.toLowerCase() === v.toLowerCase()) ?? null;
};
