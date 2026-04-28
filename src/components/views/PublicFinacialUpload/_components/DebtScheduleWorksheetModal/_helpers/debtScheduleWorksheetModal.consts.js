/** XLSX row 5 column labels (1:1 with `Template - Debt Schedule.xlsx`). */
export const WORKSHEET_COLUMN_HEADERS = [
  'Name of Creditor',
  'Original Amount Financed (if Term Loan)',
  'Line of Credit Limit',
  'Original Date (Year)',
  'Current Balance',
  'Interest Rate',
  'Maturity Date',
  'Monthly Payment',
  'Collateral',
  'Current or Delinquent',
];

/** UniversalInput defaults to dark theme; force light fields inside this modal. */
export const INPUT_LIGHT_STYLE = { backgroundColor: '#ffffff', color: '#212529' };

export const TABLE_CELL_INPUT_CLASS =
  'rounded-1 py-6 px-6 fs-7 border shadow-none w-100';

/** Always use a textarea for these columns when content is long enough (see helpers). */
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
