import { Signal } from '@fyclabs/tools-fyc-react/signals';
import { reactSelectStyles } from '@src/components/global/Inputs/_helpers/reactSelectStyles';

/**
 * Which creditor/collateral field (`r0_nameOfCreditor`, …) is in edit mode (textarea).
 * Blurred cells show a one-line preview; ellipsis works on the preview, not on textarea.
 */
export const $debtScheduleWorksheetWrapCellEdit = Signal({ name: null });

/** XLSX row 5 column labels (1:1 with `Template - Debt Schedule.xlsx`). */
export const WORKSHEET_COLUMN_HEADERS = [
  'Name of Creditor',
  'Original Amount Financed (if Term Loan)',
  'Line of Credit Limit',
  'Original Date (Year)',
  'Current Balance',
  'Interest Rate',
  'Maturity Date (MM/DD/YYYY)',
  'Monthly Payment',
  'Collateral',
  'Current or Delinquent',
];

/**
 * Percent widths for `<colgroup>` — order matches `WORKSHEET_COLUMN_HEADERS` / `DEBT_SCHEDULE_FORM_COLUMN_KEYS`.
 * With `table-layout: fixed`, reserves space for “Current or Delinquent”; wrap columns ellipsis inside their share.
 */
export const WORKSHEET_COLGROUP_WIDTHS = [
  '11%',
  '8%',
  '8%',
  '7%',
  '9%',
  '6%',
  '12%',
  '8%',
  '15%',
  '16%',
];

/** Minimum width for date columns and the status column `<td>` (7.5rem — “75” readability). */
export const WORKSHEET_DATE_CELL_MIN_WIDTH = '7.5rem';

/** UniversalInput defaults to dark theme; force light fields inside this modal. */
export const INPUT_LIGHT_STYLE = { backgroundColor: '#ffffff', color: '#212529' };

export const TABLE_CELL_INPUT_CLASS =
  'rounded-1 py-6 px-6 fs-7 border shadow-none w-100';

/** TD class for creditor/collateral columns (min-width 0 so ellipsis works in table layout). */
export const WORKSHEET_WRAP_CELL_TD_CLASS = 'debt-schedule-worksheet-wrap-cell';

/** TD class for Current/Delinquent select column. */
export const WORKSHEET_SELECT_CELL_TD_CLASS = 'debt-schedule-worksheet-select-cell';

/** Creditor & collateral columns (use DebtScheduleWrapCellField in the modal table). */
export const WORKSHEET_WRAP_KEYS = new Set(['nameOfCreditor', 'collateral']);

/** Column text alignment (headers, cells, inputs) — amounts right + tabular figures. */
export const WORKSHEET_COL_ALIGN = {
  nameOfCreditor: 'text-start ',
  originalAmountFinanced: 'text-end tabular-nums',
  lineOfCreditLimit: 'text-end tabular-nums',
  originalDateYear: 'text-center',
  currentBalance: 'text-end tabular-nums',
  interestRate: 'text-end tabular-nums',
  maturityDate: 'text-start',
  monthlyPayment: 'text-end tabular-nums',
  collateral: 'text-start',
  currentOrDelinquent: 'text-start',
};

/** Columns edited with numeric currency-style typing (commas + up to 2 decimals, no $). */
export const DEBT_SCHEDULE_CURRENCY_COLUMN_KEYS = new Set([
  'originalAmountFinanced',
  'lineOfCreditLimit',
  'currentBalance',
  'monthlyPayment',
]);

/** Stored as plain strings; API normalizes with includes('delinq'). */
export const CURRENT_OR_DELINQUENT_SELECT_OPTIONS = [
  { value: 'Current', label: 'Current' },
  {
    value: 'Delinquent',
    label: 'Delinquent',
  },
];

/** Worksheet table select: light cell styling (matches UniversalInput cells), full value text — not compact pill. */
export const WORKSHEET_SELECT_STYLES = {
  ...reactSelectStyles,
  control: (base, state) => ({
    ...reactSelectStyles.control(base, state),
    minHeight: '38px',
    minWidth: '6.5rem',
    backgroundColor: '#info-800',
    border: '1px solid #dee2e6',
    borderRadius: '0.25rem',
    color: '#info-100',
    paddingLeft: '4px',
    paddingRight: '4px',
  }),
  valueContainer: (base, state) => ({
    ...reactSelectStyles.valueContainer(base, state),
    paddingLeft: '6px',
    paddingRight: '2px',
    marginLeft: '0',
    paddingTop: '2px',
    paddingBottom: '2px',
    color: '#info-100',
    flexWrap: 'nowrap',
  }),
  singleValue: (base, state) => ({
    ...reactSelectStyles.singleValue(base, state),
    color: '#info-100',
    maxWidth: 'calc(100% - 22px)',
  }),
  placeholder: (base, state) => ({
    ...reactSelectStyles.placeholder(base, state),
    color: '#info-800',
  }),
  input: (base, state) => ({
    ...reactSelectStyles.input(base, state),
    color: '#info-100',
  }),
  dropdownIndicator: (base, state) => ({
    ...reactSelectStyles.dropdownIndicator(base, state),
    color: '#info-800',
    paddingLeft: '2px',
  }),
  clearIndicator: (base, state) => ({
    ...reactSelectStyles.clearIndicator(base, state),
    color: '#info-800',
  }),
  indicatorSeparator: (base) => ({
    ...base,
    display: 'none',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#ffffff',
    border: '1px solid #dee2e6',
    borderRadius: '0.25rem',
    overflow: 'hidden',
  }),
  menuPortal: (base) => ({
    ...reactSelectStyles.menuPortal(base),
    zIndex: 9999,
  }),
};
