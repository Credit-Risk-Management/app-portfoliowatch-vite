/**
 * @param {unknown} ebitda
 * @param {boolean} [incomeStatementPackageQuarterly]
 * @returns {number|null}
 */
export const annualizedEbitdaForCovenantDisplay = (ebitda, incomeStatementPackageQuarterly) => {
  const n = typeof ebitda === 'number' ? ebitda : parseFloat(String(ebitda ?? ''));
  if (!Number.isFinite(n)) return null;
  return incomeStatementPackageQuarterly ? n * 4 : n;
};

/**
 * @param {boolean} [incomeStatementPackageQuarterly]
 * @returns {string}
 */
export const incomePeriodLabel = (incomeStatementPackageQuarterly) => (
  incomeStatementPackageQuarterly ? 'Quarter (3 months)' : 'Annual / YTD'
);
