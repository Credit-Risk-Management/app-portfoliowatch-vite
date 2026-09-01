/**
 * Shared helpers for Sensible / OCR `{ value, type }` scalar shapes in the Vite app.
 * Profit margin normalization and derived ratios mirror
 * `api-portfoliowatch-express/src/services/combinedSensibleExtractMetrics.service.ts`.
 */

export function parseApiNumber(str) {
  if (str == null || str === '') return NaN;
  const raw = String(str).trim();
  if (!raw) return NaN;

  // Accounting negatives like "( $1,234.56 )"
  const isParenNegative = /^\(.*\)$/.test(raw);
  const unsigned = isParenNegative ? raw.slice(1, -1) : raw;
  const cleaned = unsigned.replace(/[$,%\s]/g, '');
  const parsed = Number(cleaned);
  if (Number.isNaN(parsed)) return NaN;
  return isParenNegative ? -Math.abs(parsed) : parsed;
}

/** Read `.value` from Sensible scalar objects (and compatible shapes). */
export function getSensibleScalar(obj) {
  return obj && typeof obj.value !== 'undefined' ? obj.value : null;
}

/** Alias — many call sites use `getVal`. */
export const getVal = getSensibleScalar;

/**
 * Ratios in (0, 1] or [-1, 0) are stored as percentage points (e.g. 0.08 → 8).
 * Values outside that band are treated as already on percentage scale (e.g. 12.5).
 */
export function normalizeProfitMarginForStorage(raw) {
  if (raw === undefined || raw === null || !Number.isFinite(Number(raw))) return undefined;
  const n = Number(raw);
  if (n > 0 && n <= 1) return parseFloat((n * 100).toFixed(4));
  if (n < 0 && n >= -1) return parseFloat((n * 100).toFixed(4));
  return parseFloat(n.toFixed(4));
}

/**
 * Flat `parsed_document` income scalars (camelCase + `is_*` aliases): explicit `profitMargin`,
 * else Sensible JsonLogic — COGS truthy → grossProfit ÷ grossRevenue, else netIncome ÷ grossRevenue.
 * @param {object} parsedDocument
 * @param {object} [options]
 * @param {(obj: unknown) => unknown} [options.getVal]
 * @param {number} [options.grossRevenue] — when already resolved for `grossRevenue` IS field
 */
export function deriveProfitMarginPercentFromIncomeScalars(parsedDocument, options = {}) {
  if (!parsedDocument || typeof parsedDocument !== 'object') return undefined;
  const { getVal: getValOpt, grossRevenue: grossRevenueOpt } = options;
  const get = getValOpt ?? getSensibleScalar;

  let grossRevenue = grossRevenueOpt;
  if (grossRevenue === undefined) {
    const grRaw = get(parsedDocument.grossRevenue)
      ?? get(parsedDocument.totalIncome)
      ?? get(parsedDocument.revenueBase)
      ?? get(parsedDocument.grossProfit);
    const n = parseApiNumber(grRaw);
    grossRevenue = Number.isNaN(n) ? undefined : n;
  }

  if (grossRevenue === undefined || grossRevenue === 0 || !Number.isFinite(grossRevenue)) {
    return undefined;
  }

  const cogsRaw = get(parsedDocument.costOfGoodsSold)
    ?? get(parsedDocument.is_costOfGoodsSold);
  const cogs = parseApiNumber(cogsRaw);
  const gpRaw = get(parsedDocument.grossProfit) ?? get(parsedDocument.is_grossProfit);
  const grossProfit = parseApiNumber(gpRaw);
  const hasCogs = !Number.isNaN(cogs) && cogs !== 0;
  const hasGrossProfit = !Number.isNaN(grossProfit) && Number.isFinite(grossProfit);
  const useGrossMargin = hasCogs || hasGrossProfit;

  if (useGrossMargin) {
    let gp = NaN;
    if (hasGrossProfit) {
      gp = grossProfit;
    } else if (hasCogs) {
      gp = grossRevenue - cogs;
    }
    if (!Number.isNaN(gp) && Number.isFinite(gp)) {
      return normalizeProfitMarginForStorage(gp / grossRevenue);
    }
  }

  const niRaw = get(parsedDocument.netIncome) ?? get(parsedDocument.is_netIncome);
  const ni = parseApiNumber(niRaw);
  if (!Number.isNaN(ni) && Number.isFinite(ni)) {
    return normalizeProfitMarginForStorage(ni / grossRevenue);
  }

  const explicitRaw = get(parsedDocument.profitMargin);
  if (explicitRaw != null && explicitRaw !== '') {
    const explicitPm = parseApiNumber(explicitRaw);
    if (!Number.isNaN(explicitPm)) {
      return normalizeProfitMarginForStorage(explicitPm);
    }
  }

  return undefined;
}

/** Form fallback when user omits margin: net income ÷ gross revenue as %. */
export function profitMarginPercentFromNetIncome(netIncome, grossRevenue) {
  if (grossRevenue == null || grossRevenue <= 0 || netIncome == null) return null;
  return parseFloat(((netIncome / grossRevenue) * 100).toFixed(4));
}
