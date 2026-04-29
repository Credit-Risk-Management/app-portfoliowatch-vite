import {
  DEBT_SCHEDULE_FORM_COLUMN_KEYS,
  DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT,
  debtScheduleFormField,
} from '../../../_helpers/publicFinancialUpload.consts';
import {
  WORKSHEET_COL_ALIGN,
  WORKSHEET_WRAP_KEYS,
  WORKSHEET_WRAP_CELL_PREVIEW_MAX_LEN,
  CURRENT_OR_DELINQUENT_SELECT_OPTIONS,
  DEBT_SCHEDULE_CURRENCY_COLUMN_KEYS,
} from './debtScheduleWorksheetModal.consts';

export const getWorksheetColumnAlignClass = (colKey) => WORKSHEET_COL_ALIGN[colKey] ?? 'text-start';

/** Creditor & collateral: preview row vs in-place textarea (see DebtScheduleWrapCellField). */
export const worksheetCellTruncatesWhenBlurred = (colKey) => WORKSHEET_WRAP_KEYS.has(colKey);

/** Blurred wrap-cell preview: cap visible length for creditor & collateral; full value in edit / `title`. */
export const formatWorksheetWrapCellPreviewDisplay = (rawText, columnKey) => {
  const s = String(rawText ?? '');
  if (WORKSHEET_WRAP_KEYS.has(columnKey) && s.length > WORKSHEET_WRAP_CELL_PREVIEW_MAX_LEN) {
    return `${s.slice(0, WORKSHEET_WRAP_CELL_PREVIEW_MAX_LEN)}…`;
  }
  return s;
};

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

/** Instructional placeholders per column (empty-state only; no fill background). */
const CELL_PLACEHOLDER_BY_KEY = {
  nameOfCreditor: 'Enter creditor name',
  originalAmountFinanced: 'Enter original loan amount',
  lineOfCreditLimit: 'Credit limit (if applicable)',
  originalDateYear: 'Year funded (e.g. 2023)',
  currentBalance: 'Current balance',
  interestRate: 'e.g. 8.5%',
  maturityDate: 'MM / DD / YYYY',
  monthlyPayment: 'Monthly payment',
  collateral: 'Describe collateral',
};

export const worksheetCellPlaceholder = (colKey) => (
  CELL_PLACEHOLDER_BY_KEY[colKey] ?? '—'
);

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

const WORKSHEET_FIELD_NAME_RE = /^r(\d+)_([a-zA-Z0-9_]+)$/;

/** True when every debt column in the row is blank (trimmed). */
export const rowIsEmptyInDebtWorksheet = (form, rowIdx) => (
  DEBT_SCHEDULE_FORM_COLUMN_KEYS.every((k) => !String(form[debtScheduleFormField(rowIdx, k)] ?? '').trim())
);

/** First all-empty data row, else `0` (all rows partially filled). */
export const findFirstEmptyDebtWorksheetRowIndex = (form) => {
  for (let r = 0; r < DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT; r += 1) {
    if (rowIsEmptyInDebtWorksheet(form, r)) return r;
  }
  return 0;
};

/**
 * Next/previous field name in row-major column order (`DEBT_SCHEDULE_FORM_COLUMN_KEYS`), or `null` at grid edge.
 */
export const getAdjacentDebtWorksheetFieldName = (fieldName, backward) => {
  const m = String(fieldName ?? '').match(WORKSHEET_FIELD_NAME_RE);
  if (!m) return null;
  const row = Number(m[1]);
  const colKey = m[2];
  const colIdx = DEBT_SCHEDULE_FORM_COLUMN_KEYS.indexOf(colKey);
  if (colIdx === -1) return null;
  const lastCol = DEBT_SCHEDULE_FORM_COLUMN_KEYS.length - 1;
  const lastRow = DEBT_SCHEDULE_XLSX_DATA_ROW_COUNT - 1;

  if (backward) {
    if (colIdx > 0) {
      return debtScheduleFormField(row, DEBT_SCHEDULE_FORM_COLUMN_KEYS[colIdx - 1]);
    }
    if (row > 0) {
      return debtScheduleFormField(row - 1, DEBT_SCHEDULE_FORM_COLUMN_KEYS[lastCol]);
    }
    return null;
  }
  if (colIdx < lastCol) {
    return debtScheduleFormField(row, DEBT_SCHEDULE_FORM_COLUMN_KEYS[colIdx + 1]);
  }
  if (row < lastRow) {
    return debtScheduleFormField(row + 1, DEBT_SCHEDULE_FORM_COLUMN_KEYS[0]);
  }
  return null;
};
