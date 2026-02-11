import { COLOR_HEX_MAP } from '@src/components/views/Dashboard/_helpers/dashboard.consts';

const calculateLeverage = (liabilities, assets) => {
  if (!liabilities || !assets) return null;
  return liabilities / assets;
};

const calculateLiquidityCoverage = (liquidity, debtService) => {
  if (!liquidity || !debtService) return null;
  return liquidity / debtService;
};

const liquidityScore = (coverage) => {
  if (coverage >= 5) return 60;
  if (coverage >= 4) return 50;
  if (coverage >= 3) return 40;
  if (coverage >= 2) return 30;
  if (coverage >= 1.5) return 20;
  if (coverage >= 1) return 10;
  return 0;
};

const leverageScore = (leverage) => {
  if (leverage <= 0.3) return 40;
  if (leverage <= 0.4) return 32;
  if (leverage <= 0.5) return 24;
  if (leverage <= 0.6) return 16;
  if (leverage <= 0.7) return 8;
  return 0;
};

const getStrengthMeta = (score) => {
  if (score >= 85) return { label: 'Strong', color: 'success' };
  if (score >= 70) return { label: 'Acceptable', color: 'info' };
  if (score >= 55) return { label: 'Weak', color: 'primary' };
  return { label: 'High Risk', color: 'danger' };
};

/** Returns hex color for guarantor strength score (same palette as WATCH Score / COLOR_HEX_MAP). */
const getStrengthColorHex = (score) => {
  const meta = getStrengthMeta(score);
  return COLOR_HEX_MAP[meta.color] ?? COLOR_HEX_MAP.secondary;
};

export const getGuarantorDetailsHelpers = {
  calculateLeverage,
  calculateLiquidityCoverage,
  liquidityScore,
  leverageScore,
  getStrengthMeta,
  getStrengthColorHex,
};

export default getGuarantorDetailsHelpers;
