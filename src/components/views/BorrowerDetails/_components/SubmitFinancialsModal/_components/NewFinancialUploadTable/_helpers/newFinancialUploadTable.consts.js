/** Same logical sections as the document workspace; all optional (pick what you need). */
export const NEW_FINANCIAL_SECTION_ROWS = [
  { sectionId: 'balanceSheet', title: 'Balance sheet' },
  {
    sectionId: 'incomeStatementQuarterly',
    title: 'Quarterly income statement (P&L for the period)',
  },
  {
    sectionId: 'incomeStatementYtd',
    title: 'YTD income statement',
  },
  { sectionId: 'debtScheduleWorksheet', title: 'Debt schedule' },
  { sectionId: 'taxReturn', title: 'Tax return' },
];

/** Keys align with `SignalTable` row objects from `buildUploadTableRows`. */
export const NEW_FINANCIAL_UPLOAD_TABLE_HEADERS = [
  { key: 'document', value: 'Document' },
  { key: 'status', value: 'Status' },
  { key: 'file', value: 'File' },
  { key: 'action', value: 'Action' },
];
