/**
 * Canonical format: percentage points (0–100+). Legacy decimal fractions (0–1) are multiplied by 100.
 * Used for profit margin, debt-to-income ratio, and similar fields.
 */
export function normalizeRatioDecimalToPercent(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = parseFloat(value);
  if (Number.isNaN(num)) return null;
  if (num > 0 && num <= 1) return num * 100;
  return num;
}

/** Format a normalized or raw ratio as a display string with % (normalizes decimals first). */
export function formatRatioPercentForDisplay(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  const normalized = normalizeRatioDecimalToPercent(value);
  if (normalized === null || Number.isNaN(normalized)) return 'N/A';
  return `${normalized.toFixed(2)}%`;
}
