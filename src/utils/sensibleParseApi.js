/* eslint-disable no-nested-ternary */
import {
  getVal,
  parseApiNumber,
} from './sensibleExtractPrimitives';
import { organizationNameToSensibleSlug } from './organizationNameToSensibleSlug';

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

/** Default Sensible→UI normalizer for guarantor PFS / personal tax client-side parsing. */
export const GUARANTOR_SENSIBLE_NORMALIZER_V1 = 'v1';

/** Matches `FIRST_ALLIANCE_ORG_SLUG` in api `pfsOrgConfigRegistry.ts` (slug of "First Alliance"). */
export const FIRST_ALLIANCE_ORG_SLUG = 'first_alliance';

const PERSONAL_DOC_TYPES_WITH_NORMALIZER = new Set([
  'personalFinancialStatement',
  'personalTaxReturn',
]);

const extractMonthlyDebtFromNotes = (rawNotes) => {
  if (!rawNotes || typeof rawNotes !== 'string') return 0;
  const matches = rawNotes.match(/\b\d{2,5}\b/g) || [];
  return matches
    .map(Number)
    .filter((n) => Number.isFinite(n) && n < 5000)
    .reduce((sum, n) => sum + n, 0);
};

/** First candidate that yields a valid calendar date string for PFS rows. */
function resolvePfsAsOfDateString(row) {
  const candidates = [
    getDateFromRow(row, 'signatureDate'),
    getDateFromRow(row, 'as_of_date'),
    getVal(row.asOfDate),
    getVal(row.as_of_date),
    getVal(row.reportDate),
    getDateFromRow(row, 'periodEnd'),
    getDateFromRow(row, 'periodStart'),
  ]
    .filter((c) => c != null && String(c).trim())
    .map((c) => {
      const s = String(c).trim();
      const isoGuess = asOfDateFromApi(s);
      if (isoGuess) return isoGuess;
      if (/^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime())) return s;
      return '';
    });
  return candidates.find(Boolean) || '';
}

function effectiveGuarantorOrgSlug(parserOptions) {
  const explicit = parserOptions?.organizationSlug != null
    ? String(parserOptions.organizationSlug).trim().toLowerCase()
    : '';
  if (explicit !== '') return explicit;
  return organizationNameToSensibleSlug(parserOptions?.organizationName).trim().toLowerCase();
}

function isFirstAllianceGuarantorPfs(parserOptions) {
  return effectiveGuarantorOrgSlug(parserOptions) === FIRST_ALLIANCE_ORG_SLUG;
}

function parseMoneyLike(v) {
  if (v == null) return undefined;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(String(v).replace(/[$,]/g, '').trim());
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function cellValue(cell) {
  if (cell == null) return undefined;
  if (typeof cell === 'object' && cell !== null && 'value' in cell) return cell.value;
  return cell;
}

function findColumn(cols, ids) {
  return ids.reduce((acc, id) => {
    if (acc != null) return acc;
    const c = cols.find((x) => x?.id === id);
    return c?.values?.length ? c : acc;
  }, undefined);
}

function withPfsRootTableAliasesDoc(inner) {
  if (inner == null || typeof inner !== 'object') return {};
  const merged = { ...inner };
  const pick = (canonical, aliases) => {
    if (merged[canonical] != null) return;
    const hit = aliases.find((a) => merged[a] != null);
    if (hit != null) merged[canonical] = merged[hit];
  };
  pick('mortgages', ['real_estate_debt', 'real_estate_mortgages', 'mortgage_loans']);
  pick('installment_loans', ['installment_debt', 'term_loans']);
  pick('revolving_accounts', ['revolving_credit', 'credit_cards']);
  pick('other_liabilities', ['other_debt']);
  pick('cash_accounts', ['cash_and_equivalents', 'liquid_assets']);
  return merged;
}

function sumCurrencyColumnFa(table, columnIds) {
  if (table == null || typeof table !== 'object') return undefined;
  const cols = table.columns;
  if (!Array.isArray(cols)) return undefined;
  const col = findColumn(cols, columnIds);
  if (!col?.values?.length) return undefined;
  const sum = col.values
    .map((cell) => (cell == null ? undefined : parseMoneyLike(cellValue(cell))))
    .filter((n) => n != null)
    .reduce((a, b) => a + b, 0);
  return sum > 0 ? sum : undefined;
}

function sumMonthlyColumnTimes12Fa(table, columnIds) {
  if (table == null || typeof table !== 'object') return 0;
  const cols = table.columns;
  if (!Array.isArray(cols)) return 0;
  const col = findColumn(cols, columnIds);
  if (!col?.values?.length) return 0;
  return col.values
    .map((cell) => (cell == null ? undefined : parseMoneyLike(cellValue(cell))))
    .filter((m) => m != null && m > 0)
    .reduce((annual, m) => annual + m * 12, 0);
}

function revolvingDedupeKeyFa(accountType, currentBalance, interestRate, minimumPayment) {
  const t = typeof accountType === 'string'
    ? accountType.trim().toLowerCase()
    : accountType == null
      ? ''
      : String(accountType).trim().toLowerCase();
  const b = parseMoneyLike(currentBalance);
  const r = parseMoneyLike(interestRate);
  const m = parseMoneyLike(minimumPayment);
  return [t, b ?? '', r ?? '', m ?? ''].join('\u001f');
}

const EMPTY_REVOLVING_DEDUPE_FA = ['', '', '', ''].join('\u001f');

function revolvingDedupeKeyForRowFa(i, accountType, currentBalance, interestRate, minimumPayment) {
  const base = revolvingDedupeKeyFa(accountType, currentBalance, interestRate, minimumPayment);
  if (base === EMPTY_REVOLVING_DEDUPE_FA) return `${base}\u001f#${i}`;
  return base;
}

function columnValuesByIdsFa(cols, ids) {
  const col = findColumn(cols, ids);
  return col?.values;
}

function sumRevolvingAccountsAnnualDeduplicatedFa(table) {
  if (table == null || typeof table !== 'object') return 0;
  const cols = table.columns;
  if (!Array.isArray(cols)) return 0;
  const at = columnValuesByIdsFa(cols, ['account_type', 'accountType']);
  const cb = columnValuesByIdsFa(cols, ['current_balance', 'currentBalance']);
  const ir = columnValuesByIdsFa(cols, ['interest_rate', 'interestRate']);
  const minCol = columnValuesByIdsFa(cols, ['minimum_payment', 'minimumPayment']);
  const mnp = columnValuesByIdsFa(cols, ['monthly_payment', 'monthlyPayment']);
  const len = Math.max(0, ...[at, cb, ir, minCol, mnp].map((a) => a?.length ?? 0));
  if (len === 0) return 0;
  const seen = new Set();
  return Array.from({ length: len }, (_, i) => {
    const key = revolvingDedupeKeyForRowFa(
      i,
      at?.[i] == null ? null : cellValue(at[i]),
      cb?.[i] == null ? null : cellValue(cb[i]),
      ir?.[i] == null ? null : cellValue(ir[i]),
      minCol?.[i] == null ? null : cellValue(minCol[i]),
    );
    if (seen.has(key)) return 0;
    seen.add(key);
    const monthPay = mnp?.[i] == null ? undefined : parseMoneyLike(cellValue(mnp[i]));
    const minPay = minCol?.[i] == null ? undefined : parseMoneyLike(cellValue(minCol[i]));
    const m = (monthPay != null && monthPay > 0)
      ? monthPay
      : (minPay != null && minPay > 0 ? minPay : undefined);
    return m != null ? m * 12 : 0;
  }).reduce((a, b) => a + b, 0);
}

const MONTHLY_PAY_IDS_FA = ['monthly_payment', 'monthlyPayment'];

function totalAnnualDebtServiceFromPfsTablesFa(root) {
  return (
    sumMonthlyColumnTimes12Fa(root.mortgages, MONTHLY_PAY_IDS_FA)
    + sumMonthlyColumnTimes12Fa(root.installment_loans, MONTHLY_PAY_IDS_FA)
    + sumRevolvingAccountsAnnualDeduplicatedFa(root.revolving_accounts)
    + sumMonthlyColumnTimes12Fa(root.other_liabilities, MONTHLY_PAY_IDS_FA)
  );
}

function getScalarFirstVal(doc, keys) {
  return keys.reduce((found, k) => {
    if (found !== undefined && found !== null && found !== '') return found;
    const v = getVal(doc[k]);
    return v != null && v !== '' ? v : found;
  }, undefined);
}

/**
 * First Alliance PFS: align with API `buildCanonicalPfsFirstAllianceTaskExtraction` / task_extraction tables.
 */
function extractFirstAlliancePfsFromParsedDocument(parsedDocument, asOfDate, {
  num,
  numOrUndefined,
  liquidityVal,
}) {
  const root = withPfsRootTableAliasesDoc(parsedDocument);

  const totalAssets = num(
    getScalarFirstVal(root, ['total_assets', 'totalAssets'])
    ?? getVal(root.totalAssets)
    ?? getVal(root.total_assets),
  );
  const totalLiabilities = num(
    getScalarFirstVal(root, ['total_liabilities', 'totalLiabilities'])
    ?? getVal(root.totalLiabilities)
    ?? getVal(root.total_liabilities),
  );
  const netWorth = num(
    getScalarFirstVal(root, ['net_worth', 'netWorth'])
    ?? getVal(root.netWorth)
    ?? getVal(root.net_worth),
  );

  const liqTable = sumCurrencyColumnFa(root.cash_accounts, ['balance', 'current_balance', 'currentBalance']);
  const liquidity = liqTable !== undefined && Number.isFinite(liqTable) ? liqTable : liquidityVal();

  const cashOnHand = num(
    getVal(root.cashOnHand)
    ?? getVal(root.cash_on_hand)
    ?? getVal(root.cash),
  );
  const cash = cashOnHand > 0 ? cashOnHand : liquidity;

  const annualFromTables = totalAnnualDebtServiceFromPfsTablesFa(root);
  const monthlyMortgagePayments = numOrUndefined(
    getVal(root.monthlyMortgagePayments)
    ?? getVal(root.monthly_mortgage_payments),
  ) ?? 0;
  const notesPayableRaw = getVal(root.notesPayableRaw)
    ?? getVal(root.notes_payable_raw)
    ?? getVal(root.notesPayable)
    ?? '';
  const monthlyPaymentsFromNotes = extractMonthlyDebtFromNotes(notesPayableRaw);
  const derivedMonthlyFlat = monthlyPaymentsFromNotes + monthlyMortgagePayments;
  const annualFlat = derivedMonthlyFlat > 0 ? derivedMonthlyFlat * 12 : 0;
  const annualDebtService = annualFromTables > 0 ? annualFromTables : annualFlat;

  return {
    asOfDate,
    totalAssets,
    totalLiabilities,
    netWorth,
    liquidity,
    cash,
    annualDebtService,
  };
}

// source: 'bs' | 'is' | 'pfs' | 'tax' | 'personalTax',
/**
 * @param {object} [parserOptions]
 * @param {string} [parserOptions.normalizerVersion] — only used for `pfs` / `personalTax` sources
 *   (guarantor personal docs); defaults to {@link GUARANTOR_SENSIBLE_NORMALIZER_V1} inside those branches.
 * @param {string} [parserOptions.organizationSlug] — optional; else derived from `organizationName`.
 * @param {string} [parserOptions.organizationName] — optional; used with {@link organizationNameToSensibleSlug} for First Alliance PFS routing.
 */
export function extractDataFromApiResponse(
  parsedDocument,
  source,
  asOfDate,
  parserOptions,
) {
  const normalizerVersion = parserOptions?.normalizerVersion;
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
    ?? getVal(parsedDocument.cashEquivalents),
  );

  if (source === 'tax') {
    const grossReceipts = num(getVal(parsedDocument.scheduleC_grossReceipts) ?? getVal(parsedDocument.totalIncome));
    const grossProfit = num(getVal(parsedDocument.scheduleC_grossProfit));
    const netIncome = num(getVal(parsedDocument.scheduleC_netProfit));
    const depreciationExpense = num(getVal(parsedDocument.scheduleC_depreciationExpense));
    const interestExpense = num(getVal(parsedDocument.scheduleC_interestExpense));
    const ebitdaComputed = netIncome + depreciationExpense + interestExpense;
    // Canonical format is percentage (0–100)
    const profitMargin = grossReceipts > 0
      ? parseFloat(((grossProfit / grossReceipts) * 100).toFixed(4))
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
    const pfsNormalizer = normalizerVersion ?? GUARANTOR_SENSIBLE_NORMALIZER_V1;
    if (pfsNormalizer !== GUARANTOR_SENSIBLE_NORMALIZER_V1) {
      // Add branches when new client-side PFS shapes exist (align with API `normalizers/pfs`).
    }
    if (isFirstAllianceGuarantorPfs(parserOptions)) {
      return extractFirstAlliancePfsFromParsedDocument(parsedDocument, asOfDate, {
        num,
        numOrUndefined,
        liquidityVal,
      });
    }
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
    const annualFlat = derivedMonthlyDebtService > 0 ? derivedMonthlyDebtService * 12 : 0;
    const rootFlat = withPfsRootTableAliasesDoc(parsedDocument);
    const annualFromTables = totalAnnualDebtServiceFromPfsTablesFa(rootFlat);
    const annualDebtService = annualFromTables > 0 ? annualFromTables : annualFlat;

    const liqCash = sumCurrencyColumnFa(parsedDocument.cash_accounts, ['balance', 'current_balance', 'currentBalance']);
    const liquidity = liqCash !== undefined && liqCash > 0 ? liqCash : liquidityVal();
    const cash = cashOnHand > 0 ? cashOnHand : liquidity;

    return {
      asOfDate,
      totalAssets,
      totalLiabilities,
      netWorth,
      liquidity,
      cash,
      annualDebtService,
    };
  }

  if (source === 'personalTax') {
    return {
      asOfDate,
      adjustedGrossIncome: num(getVal(parsedDocument.adjustedGrossIncome)),
    };
  }

  return null;
}

export function getDateFromRow(row, dateKey) {
  const val = getVal(row[dateKey]);
  return val != null && String(val).trim() ? String(val).trim() : '';
}

/**
 * @param {object} parsed — Sensible `parsed_document` (or equivalent row).
 * @param {'balanceSheet'|'incomeStatement'|'personalFinancialStatement'|'taxReturn'|'personalTaxReturn'} docType
 * @param {object} [options] — Only read for `personalFinancialStatement` and `personalTaxReturn`.
 * @param {string} [options.normalizerVersion] — e.g. {@link GUARANTOR_SENSIBLE_NORMALIZER_V1}; defaults to `v1` for those doc types.
 * @param {string} [options.organizationSlug] — for First Alliance PFS routing (with `organizationName`).
 * @param {string} [options.organizationName] — lender display name from `$organization.value?.name`.
 */
export function parseSingleDocResponse(parsed, docType, options) {
  if (!parsed || typeof parsed !== 'object') return null;
  const row = parsed;
  let source;
  let dateStr = '';
  const usePersonalNormalizer = PERSONAL_DOC_TYPES_WITH_NORMALIZER.has(docType);
  const parserOptions = usePersonalNormalizer
    ? {
      normalizerVersion: options?.normalizerVersion ?? GUARANTOR_SENSIBLE_NORMALIZER_V1,
      ...(options?.organizationSlug != null && String(options.organizationSlug).trim() !== ''
        ? { organizationSlug: String(options.organizationSlug).trim() }
        : {}),
      ...(options?.organizationName != null && String(options.organizationName).trim() !== ''
        ? { organizationName: String(options.organizationName).trim() }
        : {}),
    }
    : undefined;

  if (docType === 'personalFinancialStatement') {
    source = 'pfs';
    dateStr = resolvePfsAsOfDateString(row);
  } else if (docType === 'personalTaxReturn') {
    source = 'personalTax';
    const y = getVal(row.taxYear);
    const year = y != null ? String(y).trim() : '';
    if (year && /^\d{4}$/.test(year)) dateStr = `${year}-12-31`;
  } else {
    return null;
  }

  if (!dateStr || Number.isNaN(new Date(dateStr).getTime())) return null;
  const data = extractDataFromApiResponse(row, source, dateStr, parserOptions);
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

// Re-export primitives for callers that only need scalar parsing
export { getVal, parseApiNumber } from './sensibleExtractPrimitives';
