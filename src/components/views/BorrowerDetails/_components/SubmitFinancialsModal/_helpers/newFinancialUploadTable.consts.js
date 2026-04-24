/** Same logical sections as the document workspace; all optional (pick what you need). */
export const NEW_FINANCIAL_SECTION_ROWS = [
  { sectionId: 'balanceSheet', title: 'Balance sheet' },
  { sectionId: 'incomeStatement', title: 'Income statement' },
  { sectionId: 'debtScheduleWorksheet', title: 'Debt schedule' },
  { sectionId: 'taxReturn', title: 'Tax return' },
];

/** Keys align with `SignalTable` row objects built in `NewFinancialUploadTable`. */
export const NEW_FINANCIAL_UPLOAD_TABLE_HEADERS = [
  { key: 'document', value: 'Document' },
  { key: 'status', value: 'Status' },
  { key: 'file', value: 'File' },
  { key: 'action', value: 'Action' },
];
