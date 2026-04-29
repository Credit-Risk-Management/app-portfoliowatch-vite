import { Signal } from '@fyclabs/tools-fyc-react/signals';
import theme from '@src/scss/debtWorksheetTheme.module.scss';
import { reactSelectStyles } from '@src/components/global/Inputs/_helpers/reactSelectStyles';

/**
 * Which creditor/collateral field (`r0_nameOfCreditor`, …) is in edit mode (textarea).
 * Blurred cells show a one-line preview; ellipsis works on the preview, not on textarea.
 */
export const $debtScheduleWorksheetWrapCellEdit = Signal({ name: null });

/** `querySelector` / JSX `data-*` hook for programmatic focus (table grid navigation). */
export const DEBT_WORKSHEET_FOCUS_DATA_ATTR = 'data-debt-worksheet-focus';

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
 * Minimum widths for `<col>` (order matches headers / `DEBT_SCHEDULE_FORM_COLUMN_KEYS`).
 * Used with `table-layout: auto` so currency, dates, and placeholders stay readable; horizontal scroll when needed.
 */
export const WORKSHEET_COL_MIN_WIDTHS = [
  '12rem',
  '9.5rem',
  '10.5rem',
  '6.25rem',
  '10rem',
  '6.25rem',
  '10.5rem',
  '9.5rem',
  '11rem',
  '10rem',
];

/** Minimum width for date-heavy columns and the status `<td>` (MM/DD/YYYY + padding). */
export const WORKSHEET_DATE_CELL_MIN_WIDTH = '8.75rem';

/** Filled value text color; field chrome comes from `.debt-schedule-worksheet-modal` SCSS. */
export const INPUT_LIGHT_STYLE = {
  backgroundColor: theme.white,
  color: theme.textFilled,
};

/** Table cell control: padding/typography from modal SCSS (Bootstrap form-control rhythm). */
export const TABLE_CELL_INPUT_CLASS =
  'debt-schedule-worksheet-field rounded-2 border-0 shadow-none w-100';

/** TD class for creditor/collateral columns (min-width 0 so ellipsis works in table layout). */
export const WORKSHEET_WRAP_CELL_TD_CLASS = 'debt-schedule-worksheet-wrap-cell';

/** TD class for Current/Delinquent select column. */
export const WORKSHEET_SELECT_CELL_TD_CLASS = 'debt-schedule-worksheet-select-cell';

/** Creditor & collateral columns (use DebtScheduleWrapCellField in the modal table). */
export const WORKSHEET_WRAP_KEYS = new Set(['nameOfCreditor', 'collateral']);

/** Wrap-cell preview (`button`): max characters before `…` — creditor & collateral (full value in edit / `title`). */
export const WORKSHEET_WRAP_CELL_PREVIEW_MAX_LEN = 25;

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

const selectRing = `0 0 0 3px ${theme.focusRingBlue}`;

/** Select matches input field chrome (not pill); chevron from default indicator, styled neutral. */
export const WORKSHEET_SELECT_STYLES = {
  ...reactSelectStyles,
  control: (base, state) => ({
    ...reactSelectStyles.control(base, state),
    minHeight: 'calc(1.5em + 1rem + 2px)',
    minWidth: '6.5rem',
    fontSize: '1rem',
    lineHeight: 1.5,
    backgroundColor: theme.white,
    border: `1px solid ${state.isFocused ? theme.focusBlue : theme.borderNeutral}`,
    borderRadius: '7px',
    color: theme.textFilled,
    paddingLeft: '12px',
    paddingRight: '10px',
    boxShadow: state.isFocused ? selectRing : 'none',
    cursor: 'default',
    ':hover': {
      borderColor: state.isFocused ? theme.focusBlue : '#9CA3AF',
    },
  }),
  valueContainer: (base, state) => ({
    ...reactSelectStyles.valueContainer(base, state),
    paddingLeft: '2px',
    paddingRight: '4px',
    marginLeft: 0,
    paddingTop: '0',
    paddingBottom: '0',
    color: theme.textFilled,
    flexWrap: 'nowrap',
  }),
  singleValue: (base, state) => ({
    ...reactSelectStyles.singleValue(base, state),
    color: theme.textFilled,
    maxWidth: 'calc(100% - 24px)',
  }),
  placeholder: (base, state) => ({
    ...reactSelectStyles.placeholder(base, state),
    color: theme.textMuted,
  }),
  input: (base, state) => ({
    ...reactSelectStyles.input(base, state),
    color: theme.textFilled,
  }),
  dropdownIndicator: (base, state) => ({
    ...reactSelectStyles.dropdownIndicator(base, state),
    color: '#6B7280',
    padding: '0 4px',
    ':hover': {
      color: '#374151',
    },
  }),
  clearIndicator: (base, state) => ({
    ...reactSelectStyles.clearIndicator(base, state),
    color: '#6B7280',
  }),
  indicatorSeparator: (base) => ({
    ...base,
    display: 'none',
  }),
  option: (base, state) => {
    let backgroundColor = theme.white;
    if (state.isSelected) {
      backgroundColor = state.isFocused ? '#E5E7EB' : theme.rowHover;
    } else if (state.isFocused) {
      backgroundColor = '#DBEAFE';
    }
    return {
      ...base,
      backgroundColor,
      color: theme.textFilled,
      cursor: 'pointer',
      ':active': {
        backgroundColor: state.isSelected ? '#D1D5DB' : '#BFDBFE',
      },
    };
  },
  menu: (base) => ({
    ...base,
    backgroundColor: theme.white,
    border: `1px solid ${theme.borderNeutral}`,
    borderRadius: '7px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(17, 24, 39, 0.08)',
  }),
  menuPortal: (base) => ({
    ...reactSelectStyles.menuPortal(base),
    zIndex: 9999,
  }),
};
