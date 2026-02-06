// Mock data mappings for specific file names
const MOCK_DATA_BY_FILENAME = {
  // Q1 Data - March 31, 2025
  Q1_Balance_Sheet: {
    asOfDate: '2025-03-31',
    totalCurrentAssets: '2143691.98', // from sensible total_assets
    totalCurrentLiabilities: '543841.32', // from sensible total_liabilities
    cash: '243990.34',
    cashEquivalents: '1500.36',
    equity: '1545862.15', // from sensible equity
    accountsReceivable: '1351729.17', // from sensible accounts_receivable
    accountsPayable: '88093.80', // from sensible accounts_payable
    inventory: '0.00',
  },
  Q1_Income_Statement: {
    asOfDate: '2025-03-31',
    grossRevenue: '992509.15',
    netIncome: '305811.86',
    ebitda: '318998.52',
    rentalExpenses: '15225.00',
    profitMargin: '30.81',
  },
  // Q2 Data - June 30, 2025
  Q2_Balance_Sheet: {
    asOfDate: '2025-06-30',
    totalCurrentAssets: '2412528.59',
    totalCurrentLiabilities: '727510.12',
    cash: '300136.32',
    cashEquivalents: '0.00',
    equity: '1632518.28',
    accountsReceivable: '1608551.98',
    accountsPayable: '98629.34',
    inventory: '0.00',
  },
  Q2_Income_Statement: {
    asOfDate: '2025-06-30',
    grossRevenue: '832762.02',
    netIncome: '105918.33',
    ebitda: '114075.29',
    rentalExpenses: '15225.00',
    profitMargin: '12.72',
  },
  // Q3 Data - September 30, 2025
  Q3_Balance_Sheet: {
    asOfDate: '2025-09-30',
    totalCurrentAssets: '2664918.32',
    totalCurrentLiabilities: '757597.90',
    cash: '255441.89',
    cashEquivalents: '2392.46',
    equity: '1857196.53',
    accountsReceivable: '1900562.10',
    accountsPayable: '130359.65',
    inventory: '0.00',
  },
  Q3_Income_Statement: {
    asOfDate: '2025-09-30',
    grossRevenue: '1122359.06',
    netIncome: '244678.25',
    ebitda: '249000.00',
    rentalExpenses: '15225.00',
    profitMargin: '21.79',
  },
};

/**
 * Extracts the mock data key from a filename
 * @param {string} filename - The name of the uploaded file
 * @returns {string|null} - The key to use for mock data lookup, or null if not found
 */
const getMockDataKeyFromFilename = (filename) => {
  if (!filename) return null;

  // Remove file extension and normalize
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

  // Check if the filename matches any of our known patterns
  const knownKeys = Object.keys(MOCK_DATA_BY_FILENAME);
  const matchedKey = knownKeys.find((key) => {
    const withSpaces = key.replace(/_/g, ' ');
    const withUnderscores = key.replace(/_/g, '_');
    return nameWithoutExt.includes(withSpaces) ||
      nameWithoutExt.includes(withUnderscores) ||
      nameWithoutExt === key;
  });

  return matchedKey || null;
};

// Mock OCR - generate financial data based on document type and filename
const generateMockFinancialData = (documentType = 'all', filename = null) => {
  // Check if we should use filename-based mocks
  if (filename) {
    const mockKey = getMockDataKeyFromFilename(filename);
    if (mockKey && MOCK_DATA_BY_FILENAME[mockKey]) {
      return MOCK_DATA_BY_FILENAME[mockKey];
    }
  }

  // Generate realistic random values within typical ranges
  const grossRevenue = Math.floor(Math.random() * (10000000 - 2000000) + 2000000); // $2M - $10M
  const netIncomeMargin = 0.1 + Math.random() * 0.15; // 10% - 25% margin
  const netIncome = Math.floor(grossRevenue * netIncomeMargin);
  const ebitdaMargin = 0.15 + Math.random() * 0.15; // 15% - 30% margin
  const ebitda = Math.floor(grossRevenue * ebitdaMargin);

  // Generate a quarter-end date (randomly pick last 4 quarters)
  const today = new Date();
  const quartersBack = Math.floor(Math.random() * 4); // 0-3 quarters back
  const currentQuarter = Math.floor(today.getMonth() / 3);
  const targetQuarter = currentQuarter - quartersBack;

  // Calculate year and quarter
  const yearOffset = Math.floor((targetQuarter < 0 ? targetQuarter - 3 : targetQuarter) / 4);
  const year = today.getFullYear() + yearOffset;
  const quarter = ((targetQuarter % 4) + 4) % 4; // Handle negative modulo

  // Quarter end months: 0=Mar(2), 1=Jun(5), 2=Sep(8), 3=Dec(11)
  const month = quarter * 3 + 2;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const asOfDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  // Base data that's always included
  const baseData = {
    asOfDate,
  };

  // Generate data specific to document type
  if (documentType === 'balanceSheet' || documentType === 'all') {
    const totalCurrentAssets = Math.floor(Math.random() * (5000000 - 1000000) + 1000000); // $1M - $5M
    const totalCurrentLiabilities = Math.floor(totalCurrentAssets * (0.3 + Math.random() * 0.4)); // 30% - 70% of assets

    Object.assign(baseData, {
      totalCurrentAssets: totalCurrentAssets.toString(),
      totalCurrentLiabilities: totalCurrentLiabilities.toString(),
      cash: Math.floor(totalCurrentAssets * (0.15 + Math.random() * 0.25)).toString(), // 15% - 40% of current assets
      cashEquivalents: Math.floor(totalCurrentAssets * (0.05 + Math.random() * 0.15)).toString(), // 5% - 20% of current assets
      equity: Math.floor(grossRevenue * (0.5 + Math.random() * 1.5)).toString(), // 50% - 200% of revenue
      accountsReceivable: Math.floor(totalCurrentAssets * (0.2 + Math.random() * 0.3)).toString(), // 20% - 50% of current assets
      accountsPayable: Math.floor(totalCurrentLiabilities * (0.3 + Math.random() * 0.4)).toString(), // 30% - 70% of current liabilities
      inventory: Math.floor(totalCurrentAssets * (0.15 + Math.random() * 0.25)).toString(), // 15% - 40% of current assets
    });
  }

  if (documentType === 'incomeStatement' || documentType === 'all') {
    Object.assign(baseData, {
      grossRevenue: grossRevenue.toString(),
      netIncome: netIncome.toString(),
      ebitda: ebitda.toString(),
      rentalExpenses: Math.floor(grossRevenue * (0.02 + Math.random() * 0.08)).toString(), // 2% - 10% of revenue
      profitMargin: ((netIncome / grossRevenue) * 100).toFixed(2), // Calculate actual margin as percentage
    });
  }

  if (documentType === 'debtServiceWorksheet' || documentType === 'all') {
    Object.assign(baseData, {
      debtService: (1.0 + Math.random() * 2.0).toFixed(2), // 1.0 - 3.0 (actual value, not covenant)
    });
  }

  // Legacy fields for backward compatibility (when documentType is 'all')
  // Note: Covenant values are now stored on Loan model, not BorrowerFinancial
  if (documentType === 'all') {
    Object.assign(baseData, {
      currentRatio: (1.5 + Math.random() * 2.0).toFixed(2), // 1.5 - 3.5
      liquidity: Math.floor(Math.random() * (2000000 - 300000) + 300000).toString(), // $300K - $2M
      liquidityRatio: (1.2 + Math.random() * 1.5).toFixed(2), // 1.2 - 2.7
      retainedEarnings: Math.floor(grossRevenue * (0.3 + Math.random() * 0.4)).toString(), // 30% - 70% of revenue
    });
  }

  return baseData;
};

/**
 * Parses a numeric string from the API (strips $ and commas).
 * @param {string} str - Value from API (e.g. '1,122,359.06' or '$242,521.63')
 * @returns {number} - Parsed number, or NaN if invalid
 */
const parseApiNumber = (str) => {
  if (str == null || str === '') return NaN;
  const cleaned = String(str).replace(/[$,\s]/g, '');
  return Number(cleaned);
};

/**
 * Derives asOfDate (YYYY-MM-DD) from report_period string (e.g. 'July-September, 2025').
 * Uses quarter-end date when month range is detected.
 * @param {string} reportPeriod - e.g. 'July-September, 2025'
 * @returns {string|null} - e.g. '2025-09-30' or null
 */
const asOfDateFromReportPeriod = (reportPeriod) => {
  if (!reportPeriod || typeof reportPeriod !== 'string') return null;
  const yearMatch = reportPeriod.match(/\b(20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
  const s = reportPeriod.toLowerCase();
  if (s.includes('march') || s.includes('january') || s.includes('february')) return `${year}-03-31`;
  if (s.includes('june') || s.includes('april') || s.includes('may')) return `${year}-06-30`;
  if (s.includes('september') || s.includes('july') || s.includes('august')) return `${year}-09-30`;
  if (s.includes('december') || s.includes('october') || s.includes('november')) return `${year}-12-31`;
  return null;
};

/**
 * Extracts rental-related expenses from expense_categories if present.
 * @param {object} expenseCategories - parsed_document.expense_categories
 * @returns {number} - Sum of amounts for Rent/Rental categories, or 0
 */
const extractRentalExpensesFromApi = (expenseCategories) => {
  if (!expenseCategories?.columns) return 0;
  const nameCol = expenseCategories.columns.find((c) => c.id === 'category_name');
  const amountCol = expenseCategories.columns.find((c) => c.id === 'category_amount');
  if (!nameCol?.values || !amountCol?.values) return 0;
  let sum = 0;
  for (let i = 0; i < nameCol.values.length; i++) {
    const name = (nameCol.values[i]?.value || '').toLowerCase();
    if (name.includes('rent') && !name.includes('current')) {
      sum += parseApiNumber(amountCol.values[i]?.value) || 0;
    }
  }
  return sum;
};

/**
 * Extracts income statement fields from API parsed_document into the shape used by
 * borrower financials (grossRevenue, netIncome, ebitda, rentalExpenses, profitMargin, asOfDate).
 * Uses total_income/gross_profit for grossRevenue, net_income for netIncome,
 * net_operating_income as proxy for ebitda, and derives profitMargin and optional rentalExpenses.
 * @param {object} parsedDocument - API response parsed_document (e.g. from income statement OCR)
 * @returns {object} - { asOfDate?, grossRevenue, netIncome, ebitda?, rentalExpenses?, profitMargin }
 */
const extractIncomeStatementFromApiResponse = (parsedDocument) => {
  if (!parsedDocument) return null;

  const getVal = (obj) => (obj && typeof obj.value !== 'undefined' ? obj.value : null);
  const grossRevenueStr = getVal(parsedDocument.total_income) ?? getVal(parsedDocument.gross_profit);
  const netIncomeStr = getVal(parsedDocument.net_income);
  const netOperatingIncomeStr = getVal(parsedDocument.net_operating_income);
  const reportPeriod = getVal(parsedDocument.report_period);

  const grossRevenue = parseApiNumber(grossRevenueStr);
  const netIncome = parseApiNumber(netIncomeStr);
  const ebitdaNum = parseApiNumber(netOperatingIncomeStr);

  if (Number.isNaN(grossRevenue) && Number.isNaN(netIncome)) return null;

  const result = {
    grossRevenue: Number.isNaN(grossRevenue) ? '' : grossRevenue.toString(),
    netIncome: Number.isNaN(netIncome) ? '' : netIncome.toString(),
    profitMargin:
      !Number.isNaN(grossRevenue) && grossRevenue !== 0 && !Number.isNaN(netIncome)
        ? ((netIncome / grossRevenue) * 100).toFixed(2)
        : '',
  };

  const asOf = asOfDateFromReportPeriod(reportPeriod);
  if (asOf) result.asOfDate = asOf;

  if (!Number.isNaN(ebitdaNum)) result.ebitda = ebitdaNum.toString();

  const rentalExpenses = extractRentalExpensesFromApi(parsedDocument.expense_categories);
  if (rentalExpenses > 0) result.rentalExpenses = Math.floor(rentalExpenses).toString();

  return result;
};

/**
 * Derives asOfDate (YYYY-MM-DD) from report_date string (e.g. 'September 30, 2025').
 * @param {string} reportDate - e.g. 'September 30, 2025'
 * @returns {string|null} - e.g. '2025-09-30' or null
 */
const asOfDateFromReportDate = (reportDate) => {
  if (!reportDate || typeof reportDate !== 'string') return null;
  const parsed = new Date(reportDate.trim());
  if (Number.isNaN(parsed.getTime())) return null;
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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

/**
 * Extracts balance sheet fields from API parsed_document into the shape used by
 * borrower financials (totalCurrentAssets, totalCurrentLiabilities, cash, cashEquivalents,
 * equity, accountsReceivable, accountsPayable, inventory, asOfDate).
 * @param {object} parsedDocument - API response parsed_document (e.g. from balance sheet OCR)
 * @returns {object} - { asOfDate?, totalCurrentAssets, totalCurrentLiabilities, cash?, cashEquivalents?, equity, accountsReceivable?, accountsPayable?, inventory? }
 */
const extractBalanceSheetFromApiResponse = (parsedDocument) => {
  if (!parsedDocument) return null;

  const getVal = (obj) => (obj && typeof obj.value !== 'undefined' ? obj.value : null);
  const totalCurrentAssets = parseApiNumber(getVal(parsedDocument.total_current_assets));
  const totalCurrentLiabilities = parseApiNumber(getVal(parsedDocument.total_current_liabilities));
  const equity = parseApiNumber(getVal(parsedDocument.total_equity));
  const reportDate = getVal(parsedDocument.report_date);

  if (Number.isNaN(totalCurrentAssets) && Number.isNaN(totalCurrentLiabilities) && Number.isNaN(equity)) {
    return null;
  }

  const cash = sumTableAmountColumn(parsedDocument.bank_accounts);
  const accountsReceivable = sumTableAmountColumn(parsedDocument.accounts_receivable);
  const accountsPayable = sumTableAmountColumn(parsedDocument.accounts_payable_items);

  const result = {
    totalCurrentAssets: Number.isNaN(totalCurrentAssets) ? '' : totalCurrentAssets.toString(),
    totalCurrentLiabilities: Number.isNaN(totalCurrentLiabilities) ? '' : totalCurrentLiabilities.toString(),
    equity: Number.isNaN(equity) ? '' : equity.toString(),
    cash: cash > 0 ? Math.floor(cash).toString() : '',
    cashEquivalents: '', // API has no separate cash equivalents; optional 0 or leave empty
    accountsReceivable: accountsReceivable > 0 ? Math.floor(accountsReceivable).toString() : '',
    accountsPayable: accountsPayable > 0 ? Math.floor(accountsPayable).toString() : '',
    inventory: '0', // Not in balance sheet API; default 0
  };

  const asOf = asOfDateFromReportDate(reportDate);
  if (asOf) result.asOfDate = asOf;

  return result;
};

export { MOCK_DATA_BY_FILENAME, getMockDataKeyFromFilename, extractIncomeStatementFromApiResponse, extractBalanceSheetFromApiResponse };
export default generateMockFinancialData;
