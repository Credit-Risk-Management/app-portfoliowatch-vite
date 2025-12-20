// Mock data mappings for specific file names
const MOCK_DATA_BY_FILENAME = {
  // Q1 Data - March 31, 2025
  Q1_Balance_Sheet: {
    asOfDate: '2025-03-31',
    totalCurrentAssets: '2143691.98',
    totalCurrentLiabilities: '543841.32',
    cash: '243990.34',
    cashEquivalents: '1500.36',
    equity: '1545862.15',
    accountsReceivable: '1351729.17',
    accountsPayable: '88093.80',
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
      console.log(`Using mock data for: ${mockKey}`);
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
      debtService: (1.0 + Math.random() * 2.0).toFixed(2), // 1.0 - 3.0
      debtServiceCovenant: (1.0 + Math.random() * 0.5).toFixed(2), // 1.0 - 1.5
    });
  }

  // Legacy fields for backward compatibility (when documentType is 'all')
  if (documentType === 'all') {
    Object.assign(baseData, {
      currentRatio: (1.5 + Math.random() * 2.0).toFixed(2), // 1.5 - 3.5
      currentRatioCovenant: (1.2 + Math.random() * 0.5).toFixed(2), // 1.2 - 1.7
      liquidity: Math.floor(Math.random() * (2000000 - 300000) + 300000).toString(), // $300K - $2M
      liquidityCovenant: Math.floor(Math.random() * (800000 - 250000) + 250000).toString(), // $250K - $800K
      liquidityRatio: (1.2 + Math.random() * 1.5).toFixed(2), // 1.2 - 2.7
      liquidityRatioCovenant: (1.0 + Math.random() * 0.5).toFixed(2), // 1.0 - 1.5
      retainedEarnings: Math.floor(grossRevenue * (0.3 + Math.random() * 0.4)).toString(), // 30% - 70% of revenue
    });
  }

  return baseData;
};

export { MOCK_DATA_BY_FILENAME, getMockDataKeyFromFilename };
export default generateMockFinancialData;
