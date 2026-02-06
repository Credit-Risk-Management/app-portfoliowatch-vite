/**
 * Normalizes a date string from the API to YYYY-MM-DD (or null if invalid).
 * Handles "September 30, 2025", "05/01/1984", "2025-09-30", "09/30/2025".
 * @param {string} dateStr - Raw date from API
 * @returns {string|null} - YYYY-MM-DD or null
 */
const asOfDateFromApi = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Extracts PFS form fields from Sensible personal_financial_statement parsed_document.
 * Maps assets_category_total, liability_category_total, net_worth; optionally liquidity from
 * schedule1_cash_accounts amount column sum when no direct liquidity field is present.
 * Also extracts asOfDate from statement_date, as_of_date, report_date, or date_of_statement.
 * @param {object} parsedDocument - API parsed_document (e.g. exampleResponseFromSensibleApi.parsed_document)
 * @returns {object|null} - { totalAssets, totalLiabilities, netWorth, liquidity, asOfDate? } or null
 */

const parseApiNumber = (str) => {
  if (str == null || str === '') return NaN;
  const cleaned = String(str).replace(/[$,\s]/g, '');
  return Number(cleaned);
};

/**
 * Sums numeric values from a column in an API table (columns array with id and values).
 * @param {object} table - e.g. parsed_document.bank_accounts
 * @param {string} amountColumnId - column id for amounts (default 'amount')
 * @returns {number} - Sum of parsed values, or 0
 */
const sumTableAmountColumn = (table, amountColumnId = 'amount') => {
  if (!table?.columns) return 0;
  const col = table.columns.find((c) => c.id === amountColumnId);
  if (!col?.values) return 0;
  return col.values.reduce((sum, cell) => sum + (parseApiNumber(cell?.value) || 0), 0);
};

export default function extractFromPersonalFinancialStatement(parsedDocument) {
  if (!parsedDocument || typeof parsedDocument !== 'object') return null;

  const getVal = (obj) => (obj && typeof obj.value !== 'undefined' ? obj.value : null);

  const totalAssetsStr = getVal(parsedDocument.assets_category_total) ?? getVal(parsedDocument.total_assets);
  const totalLiabilitiesStr = getVal(parsedDocument.liability_category_total) ?? getVal(parsedDocument.total_liabilities);
  const netWorthStr = getVal(parsedDocument.net_worth);
  const liquidityStr = getVal(parsedDocument.liquidity);

  const totalAssetsNum = parseApiNumber(totalAssetsStr);
  const totalLiabilitiesNum = parseApiNumber(totalLiabilitiesStr);
  const netWorthNum = parseApiNumber(netWorthStr);
  const liquidityNum = parseApiNumber(liquidityStr);

  if (Number.isNaN(totalAssetsNum) && Number.isNaN(totalLiabilitiesNum) && Number.isNaN(netWorthNum)) {
    return null;
  }

  const result = {
    totalAssets: Number.isNaN(totalAssetsNum) ? '' : totalAssetsNum.toString(),
    totalLiabilities: Number.isNaN(totalLiabilitiesNum) ? '' : totalLiabilitiesNum.toString(),
    netWorth: Number.isNaN(netWorthNum) ? '' : netWorthNum.toString(),
    liquidity: Number.isNaN(liquidityNum) ? '' : liquidityNum.toString(),
  };

  if (result.liquidity === '' && parsedDocument.schedule1_cash_accounts?.columns) {
    const cashSum = sumTableAmountColumn(parsedDocument.schedule1_cash_accounts, 'amount');
    if (cashSum > 0) result.liquidity = Math.floor(cashSum).toString();
  }

  const dateStr = getVal(parsedDocument.as_of_date) ?? getVal(parsedDocument.statement_date) ?? getVal(parsedDocument.report_date) ?? getVal(parsedDocument.date_of_statement);
  const asOfDate = asOfDateFromApi(dateStr);
  if (asOfDate) result.asOfDate = asOfDate;

  return result;
}
