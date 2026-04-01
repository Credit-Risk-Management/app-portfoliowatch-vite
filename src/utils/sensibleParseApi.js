/* eslint-disable no-nested-ternary */
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

const parseApiNumber = (str) => {
  if (str == null || str === '') return NaN;
  const cleaned = String(str).replace(/[$,\s]/g, '');
  return Number(cleaned);
};

const getVal = (obj) => (obj && typeof obj.value !== 'undefined' ? obj.value : null);

const extractMonthlyDebtFromNotes = (rawNotes) => {
  if (!rawNotes || typeof rawNotes !== 'string') return 0;
  const matches = rawNotes.match(/\b\d{2,5}\b/g) || [];
  return matches
    .map(Number)
    .filter((n) => Number.isFinite(n) && n < 5000)
    .reduce((sum, n) => sum + n, 0);
};
// source: 'bs' | 'is' | 'pfs' | 'tax' | 'personalTax',
export function extractDataFromApiResponse(
  parsedDocument,
  source,
  asOfDate,
) {
  const num = (v) => {
    const n = parseApiNumber(v);
    return Number.isNaN(n) ? 0 : n;
  };
  const numOrUndefined = (v) => {
    const n = parseApiNumber(v);
    return Number.isNaN(n) ? undefined : n;
  };
  const liquidityVal = () => num(
    getVal(parsedDocument.liquidity)
    ?? getVal(parsedDocument.personal_liquidity)
    ?? getVal(parsedDocument.liquidAssets)
    ?? getVal(parsedDocument.totalLiquidAssets)
    ?? getVal(parsedDocument.cashOnHand)
    ?? getVal(parsedDocument.cash)
    ?? getVal(parsedDocument.cashAndCashEquivalents),
  );

  if (source === 'bs') {
    const cash = num(getVal(parsedDocument.cash));
    const cashEquivalents = num(getVal(parsedDocument.cashEquivalents));
    const cashMaybe = numOrUndefined(getVal(parsedDocument.cash));
    const cashEqMaybe = numOrUndefined(getVal(parsedDocument.cashEquivalents));
    const computedLiquidity = cashMaybe !== undefined || cashEqMaybe !== undefined
      ? (cashMaybe ?? 0) + (cashEqMaybe ?? 0)
      : undefined;

    return {
      asOfDate: asOfDate || asOfDateFromApi(getVal(parsedDocument.asOfDate)),
      totalAssets: num(getVal(parsedDocument.totalAssets)),
      totalLiabilities: num(getVal(parsedDocument.totalLiabilities)),
      totalCurrentAssets: num(getVal(parsedDocument.totalCurrentAssets) ?? getVal(parsedDocument.totalAssets)),
      totalCurrentLiabilities: num(getVal(parsedDocument.totalCurrentLiabilities) ?? getVal(parsedDocument.totalLiabilities)),
      equity: num(getVal(parsedDocument.equity)),
      cash,
      cashEquivalents,
      inventory: num(getVal(parsedDocument.inventory)),
      accountsReceivable: num(getVal(parsedDocument.accountsReceivable)),
      accountsPayable: num(getVal(parsedDocument.accountsPayable)),
      retainedEarnings: num(getVal(parsedDocument.retainedEarnings) ?? getVal(parsedDocument.retained_earnings)),
      liquidity: computedLiquidity ?? liquidityVal(),
    };
  }

  if (source === 'is') {
    const netIncome = num(getVal(parsedDocument.netIncome));
    const interestExpense = num(
      getVal(parsedDocument.interestExpense) ?? getVal(parsedDocument.interestPaid),
    );
    const depreciation = num(
      getVal(parsedDocument.depreciationExpense) ?? getVal(parsedDocument.depreciation),
    );
    const grossRevenue = numOrUndefined(
      getVal(parsedDocument.grossRevenue)
      ?? getVal(parsedDocument.totalIncome)
      ?? getVal(parsedDocument.revenueBase)
      ?? getVal(parsedDocument.grossProfit),
    );
    const explicitEbitda = numOrUndefined(getVal(parsedDocument.ebitda));
    const ebitdaFromParts = netIncome + interestExpense + depreciation;
    const ebitda = explicitEbitda !== undefined
      ? explicitEbitda
      : (ebitdaFromParts !== 0 ? ebitdaFromParts : undefined);
    const pmRaw = numOrUndefined(getVal(parsedDocument.profitMargin));
    let profitMargin;
    if (pmRaw !== undefined) {
      profitMargin = pmRaw > 1 && pmRaw <= 100
        ? parseFloat((pmRaw / 100).toFixed(4))
        : parseFloat(pmRaw.toFixed(4));
    } else if (grossRevenue !== undefined && grossRevenue > 0) {
      profitMargin = parseFloat((parsedDocument.total_income / grossRevenue).toFixed(4));
    }
    return {
      asOfDate,
      grossRevenue,
      netIncome,
      profitMargin,
      ebitda,
      debtService: num(getVal(parsedDocument.debtService)),
      rentalExpenses: num(
        getVal(parsedDocument.rentalExpenses) ?? getVal(parsedDocument.rentExpense),
      ),

    };
  }

  if (source === 'tax') {
    const grossReceipts = num(getVal(parsedDocument.scheduleC_grossReceipts) ?? getVal(parsedDocument.totalIncome));
    const grossProfit = num(getVal(parsedDocument.scheduleC_grossProfit));
    const netIncome = num(getVal(parsedDocument.scheduleC_netProfit));
    const depreciationExpense = num(getVal(parsedDocument.scheduleC_depreciationExpense));
    const interestExpense = num(getVal(parsedDocument.scheduleC_interestExpense));
    const ebitdaComputed = netIncome + depreciationExpense + interestExpense;
    const profitMargin = grossReceipts > 0
      ? parseFloat((grossProfit / grossReceipts).toFixed(4))
      : undefined;
    return {
      asOfDate,
      grossRevenue: grossReceipts,
      netIncome,
      profitMargin,
      ebitda: ebitdaComputed !== 0 ? ebitdaComputed : num(getVal(parsedDocument.ebitda)),
    };
  }

  if (source === 'pfs') {
    const totalAssets = num(
      getVal(parsedDocument.totalAssets)
      ?? getVal(parsedDocument.total_assets),
    );
    const totalLiabilities = num(
      getVal(parsedDocument.totalLiabilities)
      ?? getVal(parsedDocument.total_liabilities),
    );
    const netWorth = num(
      getVal(parsedDocument.netWorth)
      ?? getVal(parsedDocument.net_worth),
    );
    const cashOnHand = num(
      getVal(parsedDocument.cashOnHand)
      ?? getVal(parsedDocument.cash_on_hand)
      ?? getVal(parsedDocument.cash),
    );

    const monthlyMortgagePayments = numOrUndefined(
      getVal(parsedDocument.monthlyMortgagePayments)
      ?? getVal(parsedDocument.monthly_mortgage_payments),
    ) ?? 0;
    const notesPayableRaw = getVal(parsedDocument.notesPayableRaw)
      ?? getVal(parsedDocument.notes_payable_raw)
      ?? getVal(parsedDocument.notesPayable)
      ?? '';
    const monthlyPaymentsFromNotes = extractMonthlyDebtFromNotes(notesPayableRaw);
    const derivedMonthlyDebtService = monthlyPaymentsFromNotes + monthlyMortgagePayments;
    const annualDebtService = derivedMonthlyDebtService > 0 ? derivedMonthlyDebtService * 12 : 0;
    return {
      asOfDate,
      totalAssets,
      totalLiabilities,
      netWorth,
      liquidity: liquidityVal(),
      cash: cashOnHand,
      annualDebtService,
    };
  }

  if (source === 'personalTax') {
    return {
      asOfDate,
      adjustedGrossIncome: num(getVal(parsedDocument.adjustedGrossIncome)),
      debtToincomeRatio: 0,
    };
  }

  return null;
}
// export function getDateFromRow(row: RowRecord, dateKey: 'asOfDate' | 'periodEnd' | 'periodStart' | 'signatureDate'): string {
export function getDateFromRow(row, dateKey) {
  const val = getVal(row[dateKey]);
  return val != null && String(val).trim() ? String(val).trim() : '';
}

export function parseSingleDocResponse(parsed, docType) {
  if (!parsed || typeof parsed !== 'object') return [];
  const row = parsed;
  let source;
  let dateStr = '';

  if (docType === 'balanceSheet') {
    source = 'bs';
    dateStr = getVal(row.asOfDate) || asOfDateFromApi(getVal(row.asOfDate));
  } else if (docType === 'incomeStatement') {
    source = 'is';
    dateStr = getDateFromRow(row, 'periodEnd') || getDateFromRow(row, 'periodStart');
  } else if (docType === 'personalFinancialStatement') {
    source = 'pfs';
    dateStr = asOfDateFromApi(
      getDateFromRow(row, 'signatureDate'),
      getVal(row.asOfDate),
      getVal(row.reportDate),
      getDateFromRow(row, 'periodEnd'),
      getDateFromRow(row, 'periodStart'),
    );
  } else if (docType === 'taxReturn') {
    source = 'tax';
    const y = getVal(row.taxYear);
    const year = y != null ? String(y).trim() : '';
    if (year && /^\d{4}$/.test(year)) dateStr = `${year}-12-31`;
  } else if (docType === 'personalTaxReturn') {
    source = 'personalTax';
    const y = getVal(row.taxYear);
    const year = y != null ? String(y).trim() : '';
    if (year && /^\d{4}$/.test(year)) dateStr = `${year}-12-31`;
  } else {
    return [];
  }

  if (!dateStr || Number.isNaN(new Date(dateStr).getTime())) return [];
  const data = extractDataFromApiResponse(row, source, dateStr);
  const tca = data?.totalCurrentAssets || 0;
  const tcl = data?.totalCurrentLiabilities || 0;
  // Compute ratio whenever TCA is positive and TCL is non-zero (negative TCL is valid data)
  const currentRatio = tca > 0 && tcl !== 0
    ? parseFloat((tca / tcl).toFixed(4))
    : undefined;
  return {
    asOfDate: data?.asOfDate,
    currentRatio,
    ...data,
  };
}
export default parseSingleDocResponse;
