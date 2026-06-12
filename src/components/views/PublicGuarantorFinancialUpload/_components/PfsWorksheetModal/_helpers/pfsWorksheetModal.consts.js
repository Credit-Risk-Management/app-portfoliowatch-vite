import { Signal } from '@fyclabs/tools-fyc-react/signals';

export const PFS_TEMPLATE_PDF_URL = (() => {
  const envUrl = import.meta.env.VITE_PFS_TEMPLATE_URL;
  if (typeof envUrl === 'string' && envUrl.trim()) return envUrl.trim();
  return '/pfs-template.pdf';
})();

export const PFS_TEMPLATE_XLSX_URL = (() => {
  const envUrl = import.meta.env.VITE_PFS_TEMPLATE_XLSX_URL;
  if (typeof envUrl === 'string' && envUrl.trim()) return envUrl.trim();
  return '/pfs-template.xlsx';
})();

export const PFS_WORKSHEET_ROW_COUNT = 4;

export const PFS_HEADER_FIELDS = [
  { key: 'name', label: 'Name', placeholder: 'Full legal name', required: true },
  { key: 'asOfDate', label: 'As of date', type: 'date', required: true },
  { key: 'email', label: 'Email', placeholder: 'email@example.com' },
  { key: 'phone', label: 'Phone', placeholder: '(555) 555-0100' },
  { key: 'address', label: 'Address', placeholder: 'Street, city, state, ZIP' },
  { key: 'relatedBusiness', label: 'Related business', placeholder: 'Borrower or affiliate name (if any)' },
];

export const PFS_SUMMARY_FIELDS = [
  { key: 'summary_totalAssets', label: 'Total assets', placeholder: '0' },
  { key: 'summary_totalLiabilities', label: 'Total liabilities', placeholder: '0' },
  { key: 'summary_netWorth', label: 'Net worth', placeholder: '0' },
  { key: 'summary_annualPayments', label: 'Annual payments', placeholder: '0' },
];

/** Mirrors Template - PFS.xlsx schedules (tables in the modal). */
export const PFS_SCHEDULE_DEFINITIONS = [
  {
    id: 'A',
    title: 'Schedule A: Cash & cash equivalents',
    columns: [
      { key: 'institution', label: 'Institution' },
      { key: 'accountType', label: 'Account type' },
      { key: 'acctLastFour', label: 'Acct # (last four)' },
      { key: 'balance', label: 'Balance', inputMode: 'decimal' },
    ],
  },
  {
    id: 'B',
    title: 'Schedule B: Marketable securities',
    columns: [
      { key: 'securityName', label: 'Security name' },
      { key: 'ticker', label: 'Ticker' },
      { key: 'assetClass', label: 'Asset class' },
      { key: 'marketValue', label: 'Market value', inputMode: 'decimal' },
    ],
  },
  {
    id: 'C',
    title: 'Schedule C: Retirement accounts',
    columns: [
      { key: 'securityName', label: 'Security name' },
      { key: 'ticker', label: 'Ticker' },
      { key: 'assetClass', label: 'Asset class' },
      { key: 'marketValue', label: 'Market value', inputMode: 'decimal' },
    ],
  },
  {
    id: 'D',
    title: 'Schedule D: Real estate',
    columns: [
      { key: 'propertyAddress', label: 'Property address' },
      { key: 'type', label: 'Type' },
      { key: 'purchaseYear', label: 'Purchase year' },
      { key: 'purchasePrice', label: 'Purchase price', inputMode: 'decimal' },
      { key: 'currentValue', label: 'Current value', inputMode: 'decimal' },
      { key: 'amountOwed', label: 'Amount owed', inputMode: 'decimal' },
    ],
  },
  {
    id: 'G',
    title: 'Schedule G: Mortgage loans',
    columns: [
      { key: 'lender', label: 'Lender' },
      { key: 'propertyAddress', label: 'Property address' },
      { key: 'type', label: 'Type' },
      { key: 'originalAmt', label: 'Original amt', inputMode: 'decimal' },
      { key: 'currentBal', label: 'Current bal', inputMode: 'decimal' },
      { key: 'rate', label: 'Rate', inputMode: 'decimal' },
    ],
  },
  {
    id: 'H',
    title: 'Schedule H: Installment loans',
    columns: [
      { key: 'lender', label: 'Lender' },
      { key: 'collateral', label: 'Collateral' },
      { key: 'type', label: 'Type' },
      { key: 'originalAmt', label: 'Original amt', inputMode: 'decimal' },
      { key: 'currentBal', label: 'Current bal', inputMode: 'decimal' },
      { key: 'rate', label: 'Rate', inputMode: 'decimal' },
    ],
  },
  {
    id: 'I',
    title: 'Schedule I: Revolving debt',
    columns: [
      { key: 'issuer', label: 'Issuer' },
      { key: 'accountType', label: 'Account type' },
      { key: 'acctLastFour', label: 'Acct # (last four)' },
      { key: 'currentBal', label: 'Current bal', inputMode: 'decimal' },
      { key: 'interestRate', label: 'Interest rate', inputMode: 'decimal' },
      { key: 'minMonthlyPmt', label: 'Min mo. pmt', inputMode: 'decimal' },
    ],
  },
];

export const PFS_WORKSHEET_STEPS = [
  { id: 'about', label: 'About you' },
  { id: 'assets', label: 'Assets' },
  { id: 'liabilities', label: 'Liabilities' },
  { id: 'review', label: 'Review' },
];

export const ASSET_SCHEDULE_IDS = ['A', 'B', 'C', 'D'];
export const LIABILITY_SCHEDULE_IDS = ['G', 'H', 'I'];

export const pfsWorksheetField = (scheduleId, rowIdx, columnKey) => `sch${scheduleId}_r${rowIdx}_${columnKey}`;

export const createDefaultPfsWorksheetForm = () => {
  const base = {};
  PFS_HEADER_FIELDS.forEach(({ key }) => { base[key] = ''; });
  PFS_SUMMARY_FIELDS.forEach(({ key }) => { base[key] = ''; });
  PFS_SCHEDULE_DEFINITIONS.forEach((sch) => {
    for (let r = 0; r < PFS_WORKSHEET_ROW_COUNT; r += 1) {
      sch.columns.forEach((col) => {
        base[pfsWorksheetField(sch.id, r, col.key)] = '';
      });
    }
  });
  return base;
};

export const $pfsWorksheetForm = Signal(createDefaultPfsWorksheetForm());
export const $pfsWorksheetStep = Signal(0);
