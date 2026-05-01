/**
 * Shared helpers for Sensible / OCR `{ value, type }` scalar shapes in the Vite app.
 * Profit margin normalization and derived ratios mirror
 * `api-portfoliowatch-express/src/services/combinedSensibleExtractMetrics.service.ts`.
 */

export function parseApiNumber(str) {
  if (str == null || str === '') return NaN;
  const cleaned = String(str).replace(/[$,\s]/g, '');
  return Number(cleaned);
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

  const explicitRaw = get(parsedDocument.profitMargin);
  if (explicitRaw != null && explicitRaw !== '') {
    const explicitPm = parseApiNumber(explicitRaw);
    if (!Number.isNaN(explicitPm)) {
      return normalizeProfitMarginForStorage(explicitPm);
    }
  }

  if (grossRevenue === undefined || grossRevenue === 0 || !Number.isFinite(grossRevenue)) {
    return undefined;
  }

  const cogsRaw = get(parsedDocument.costOfGoodsSold)
    ?? get(parsedDocument.is_costOfGoodsSold);
  const cogs = parseApiNumber(cogsRaw);
  const useGrossMargin = !Number.isNaN(cogs) && cogs !== 0;

  if (useGrossMargin) {
    const gpRaw = get(parsedDocument.grossProfit) ?? get(parsedDocument.is_grossProfit);
    const gp = parseApiNumber(gpRaw);
    if (!Number.isNaN(gp) && Number.isFinite(gp)) {
      return normalizeProfitMarginForStorage(gp / grossRevenue);
    }
  }

  const niRaw = get(parsedDocument.netIncome) ?? get(parsedDocument.is_netIncome);
  const ni = parseApiNumber(niRaw);
  if (!Number.isNaN(ni) && Number.isFinite(ni)) {
    return normalizeProfitMarginForStorage(ni / grossRevenue);
  }

  return undefined;
}

/** Form fallback when user omits margin: net income ÷ gross revenue as %. */
export function profitMarginPercentFromNetIncome(netIncome, grossRevenue) {
  if (grossRevenue == null || grossRevenue <= 0 || netIncome == null) return null;
  return parseFloat(((netIncome / grossRevenue) * 100).toFixed(4));
}
