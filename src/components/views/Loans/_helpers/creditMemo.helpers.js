// Mock data mappings for credit memo filenames
// These simulate OCR extraction of covenant values from uploaded credit memo documents
const MOCK_CREDIT_MEMO_DATA = {
  // Q1 Credit Memo - March 31, 2025
  Credit_Memo_Q1: {
    asOfDate: '2025-03-31',
    debtService: '1.85',
    currentRatio: '3.94',
    liquidity: '1899701.64',
    liquidityRatio: '3.49',
  },
  // Q2 Credit Memo - June 30, 2025
  Credit_Memo_Q2: {
    asOfDate: '2025-06-30',
    debtService: '1.32',
    currentRatio: '3.32',
    liquidity: '1685018.47',
    liquidityRatio: '2.32',
  },
  // Q3 Credit Memo - September 30, 2025
  Credit_Memo_Q3: {
    asOfDate: '2025-09-30',
    debtService: '2.42',
    currentRatio: '3.52',
    liquidity: '1907320.42',
    liquidityRatio: '2.52',
  },
};

/**
 * Extracts the mock data key from a filename
 * @param {string} filename - The name of the uploaded file
 * @returns {string|null} - The key to use for mock data lookup, or null if not found
 */
const getMockCreditMemoKeyFromFilename = (filename) => {
  if (!filename) return null;

  // Remove file extension and normalize
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

  // Check if the filename matches any of our known patterns
  const knownKeys = Object.keys(MOCK_CREDIT_MEMO_DATA);
  const matchedKey = knownKeys.find((key) => {
    const withSpaces = key.replace(/_/g, ' ');
    // Also check if the key itself matches (exact match with underscores)
    const matches = nameWithoutExt.includes(withSpaces) ||
      nameWithoutExt.includes(key) ||
      nameWithoutExt === key;

    return matches;
  });

  return matchedKey || null;
};

/**
 * Generate mock credit memo data based on filename
 * If filename matches a known pattern, returns predefined mock data
 * Otherwise returns null (no auto-population)
 * @param {string} filename - The name of the uploaded file
 * @returns {Object|null} - Mock covenant data or null
 */
const generateMockCreditMemoData = (filename = null) => {
  // Check if we should use filename-based mocks
  if (filename) {
    const mockKey = getMockCreditMemoKeyFromFilename(filename);
    if (mockKey && MOCK_CREDIT_MEMO_DATA[mockKey]) {
      return MOCK_CREDIT_MEMO_DATA[mockKey];
    }
    return MOCK_CREDIT_MEMO_DATA.Credit_Memo_Q1;
  }

  // No mock data found - return null to indicate no auto-population
  return null;
};

export { MOCK_CREDIT_MEMO_DATA, getMockCreditMemoKeyFromFilename };
export default generateMockCreditMemoData;
