const roundTo4 = (value) => parseFloat(value.toFixed(4));

/**
 * DTI = monthly debt service ÷ monthly income (annual ÷ annual is equivalent).
 * @returns {number|null} Ratio (debt/income), e.g. 0.35 for 35%.
 */
export const computeDebtToIncomeRatio = (annualDebtService, adjustedGrossIncome) => {
  if (annualDebtService == null || adjustedGrossIncome == null) return null;
  if (adjustedGrossIncome <= 0) return null;
  const monthlyDebt = annualDebtService / 12;
  const monthlyIncome = adjustedGrossIncome / 12;
  if (monthlyIncome <= 0) return null;
  return roundTo4(monthlyDebt / monthlyIncome);
};

export const formatDebtToIncomeDisplay = (ratio) => {
  if (ratio == null || !Number.isFinite(ratio)) return 'N/A';
  return `${(ratio * 100).toFixed(2)}%`;
};
