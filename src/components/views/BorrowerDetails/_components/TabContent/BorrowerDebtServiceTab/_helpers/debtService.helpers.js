import { formatCurrency } from '@src/utils/formatCurrency';

export const parseEbitda = (financial) => {
  if (financial?.ebitda == null || financial.ebitda === '') return null;
  const n = Number(financial.ebitda);
  return Number.isFinite(n) ? n : null;
};

const sumEbitdaFromFinancials = (financials) => {
  if (!financials?.length || !financials.every((f) => parseEbitda(f) != null)) return null;
  return financials.reduce((sum, f) => sum + parseEbitda(f), 0);
};

export const parseStoredDscr = (financial) => {
  if (financial?.debtService == null || financial.debtService === '') return null;
  const n = Number(financial.debtService);
  return Number.isFinite(n) ? n : null;
};

const sortFinancialsByAsOfDesc = (list) => [...list].sort(
  (a, b) => new Date(b.asOfDate) - new Date(a.asOfDate),
);

export const getQuarterFromAsOfDate = (asOfDate) => {
  if (!asOfDate) return null;
  const d = new Date(asOfDate);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor(d.getMonth() / 3) + 1;
};

export const formatQuarterBadge = (asOfDate) => {
  const quarter = getQuarterFromAsOfDate(asOfDate);
  return quarter ? `Q${quarter}` : null;
};

const quarterYearIndex = (asOfDate) => {
  if (!asOfDate) return null;
  const d = new Date(asOfDate);
  if (Number.isNaN(d.getTime())) return null;
  const quarter = getQuarterFromAsOfDate(asOfDate);
  if (!quarter) return null;
  return d.getFullYear() * 4 + quarter;
};

const isCalendarYearEnd = (asOfDate) => {
  const d = new Date(asOfDate);
  if (Number.isNaN(d.getTime())) return false;
  return d.getMonth() === 11 && d.getDate() === 31;
};

const areConsecutiveQuarterChain = (financials, count) => {
  if (!financials?.length || financials.length < count) return false;
  for (let i = 0; i < count - 1; i += 1) {
    const newerIndex = quarterYearIndex(financials[i].asOfDate);
    const olderIndex = quarterYearIndex(financials[i + 1].asOfDate);
    if (newerIndex == null || olderIndex == null) return false;
    if (newerIndex - olderIndex !== 1) return false;
  }
  return true;
};

const resolveLastYearendFinancial = (financialsList) => {
  const sorted = sortFinancialsByAsOfDesc(financialsList);
  const annualFinancials = sorted.filter((f) => !f.incomeStatementPackageQuarterly);
  return annualFinancials.find((f) => isCalendarYearEnd(f.asOfDate) && parseEbitda(f) != null)
    ?? annualFinancials.find((f) => isCalendarYearEnd(f.asOfDate))
    ?? annualFinancials.find((f) => parseEbitda(f) != null)
    ?? annualFinancials[0]
    ?? null;
};

/**
 * Four consecutive quarterly EBITDA filings on file through the last yearend reporting period
 * (same quarter window as Debt Service TTM / WATCH covenant inputs).
 */
export const hasFourConsecutiveQuartersWithEbitdaThroughLastYearend = (financialsList = []) => {
  const sorted = sortFinancialsByAsOfDesc(financialsList);
  const yearend = resolveLastYearendFinancial(sorted);
  const yearendTime = yearend?.asOfDate ? new Date(yearend.asOfDate).getTime() : null;

  const quarterlyWithEbitda = sorted.filter((f) => {
    if (!f.incomeStatementPackageQuarterly || parseEbitda(f) == null) return false;
    if (yearendTime == null) return true;
    const asOfTime = new Date(f.asOfDate).getTime();
    return !Number.isNaN(asOfTime) && asOfTime <= yearendTime;
  });

  return areConsecutiveQuarterChain(quarterlyWithEbitda, 4);
};

/**
 * Loan detail — covenant Actual DSCR: when four consecutive quarterly EBITDA periods exist
 * through yearend, use the loan-level metric; otherwise use stored DSCR from the last yearend filing.
 */
export const resolveLoanDetailDebtServiceActual = (financialsList = [], loanLevelDebtService) => {
  if (hasFourConsecutiveQuartersWithEbitdaThroughLastYearend(financialsList)) {
    if (loanLevelDebtService == null || loanLevelDebtService === '') return null;
    const n = Number(loanLevelDebtService);
    return Number.isFinite(n) ? n : null;
  }
  const sorted = sortFinancialsByAsOfDesc(financialsList);
  const yearend = resolveLastYearendFinancial(sorted);
  return parseStoredDscr(yearend);
};

const tryYearendToQuarterlyDscrComparison = (currentFinancial, previousFinancial) => {
  if (!currentFinancial?.incomeStatementPackageQuarterly) return null;
  if (!previousFinancial || previousFinancial.incomeStatementPackageQuarterly) return null;

  return {
    useDscrComparison: true,
    previousDscr: parseStoredDscr(previousFinancial),
    currentDscr: parseStoredDscr(currentFinancial),
  };
};

/** True when the two most recent quarterly filings (with EBITDA) are back-to-back calendar quarters. */
export const hasTwoConsecutiveQuartersWithEbitda = (financialsList = []) => {
  const sorted = sortFinancialsByAsOfDesc(financialsList);
  const quarterlyWithEbitda = sorted.filter(
    (f) => Boolean(f.incomeStatementPackageQuarterly) && parseEbitda(f) != null,
  );
  return areConsecutiveQuarterChain(quarterlyWithEbitda, 2);
};

export const annualDebtServiceFromMonthly = (totalMonthlyPayment) => {
  if (totalMonthlyPayment == null || totalMonthlyPayment === '') return null;
  return Math.floor(Number(totalMonthlyPayment)) * 12;
};

export const quarterlyDebtServiceFromMonthly = (totalMonthlyPayment) => {
  if (totalMonthlyPayment == null || totalMonthlyPayment === '') return null;
  return Math.floor(Number(totalMonthlyPayment)) * 3;
};

const computeDscr = (ebitda, debtService) => {
  if (ebitda == null || debtService == null || debtService <= 0) return null;
  return ebitda / debtService;
};

export const getCovenantDscrFromLoans = (loans) => {
  let covenantDSCR = null;
  (loans || []).forEach((loan) => {
    if (loan.debtServiceCovenant != null && loan.debtServiceCovenant !== '') {
      const value = parseFloat(loan.debtServiceCovenant);
      if (!Number.isNaN(value) && (covenantDSCR == null || value < covenantDSCR)) {
        covenantDSCR = value;
      }
    }
  });
  return covenantDSCR;
};

export const dscrColorClass = (dscr, covenantDSCR) => {
  if (dscr == null || covenantDSCR == null) return 'text-info-50';
  return dscr >= covenantDSCR ? 'text-success-500' : 'text-danger-500';
};

export const formatSummaryCurrency = (value) => {
  if (value == null) return '$N/A';
  return formatCurrency(value);
};

export const formatSummaryDscr = (value) => {
  if (value == null) return 'N/A';
  return value.toFixed(2);
};

/**
 * Builds the three debt service summary sections (last yearend, last four quarters, last quarter).
 * Last quarter metrics are only populated when at least one quarterly income statement package exists;
 * otherwise that section shows N/A (no fallback to annual-only filings).
 */
export const buildQuarterlyDebtServiceSummary = ({
  financialsList = [],
  totalMonthlyPayment = null,
  loans = [],
}) => {
  const covenantDSCR = getCovenantDscrFromLoans(loans);
  const annualDebtService = annualDebtServiceFromMonthly(totalMonthlyPayment);
  const quarterlyDebtService = quarterlyDebtServiceFromMonthly(totalMonthlyPayment);

  const sorted = sortFinancialsByAsOfDesc(financialsList);
  const quarterlyFinancials = sorted.filter((f) => Boolean(f.incomeStatementPackageQuarterly));
  const annualFinancials = sorted.filter((f) => !f.incomeStatementPackageQuarterly);

  const yearendFinancial = annualFinancials.find((f) => isCalendarYearEnd(f.asOfDate) && parseEbitda(f) != null)
    ?? annualFinancials.find((f) => isCalendarYearEnd(f.asOfDate))
    ?? annualFinancials.find((f) => parseEbitda(f) != null)
    ?? annualFinancials[0]
    ?? null;

  const yearendEbitda = parseEbitda(yearendFinancial);
  const yearendDscr = computeDscr(yearendEbitda, annualDebtService)
    ?? parseStoredDscr(yearendFinancial);

  const lastFourQuarterly = quarterlyFinancials.slice(0, 4);
  const ttmEbitda = lastFourQuarterly.length === 4
    && lastFourQuarterly.every((f) => parseEbitda(f) != null)
    ? lastFourQuarterly.reduce((sum, f) => sum + parseEbitda(f), 0)
    : null;
  const ttmDscr = computeDscr(ttmEbitda, annualDebtService);
  const ttmTotalDebtService = ttmEbitda != null ? annualDebtService : null;

  const hasQuarterlyIncomeFinancials = quarterlyFinancials.length > 0;
  const lastQuarterFinancial = hasQuarterlyIncomeFinancials ? quarterlyFinancials[0] : null;
  const lastQuarterEbitda = hasQuarterlyIncomeFinancials ? parseEbitda(lastQuarterFinancial) : null;
  const lastQuarterTotalDebtService = hasQuarterlyIncomeFinancials ? quarterlyDebtService : null;
  const lastQuarterDscr = hasQuarterlyIncomeFinancials
    ? computeDscr(lastQuarterEbitda, quarterlyDebtService)
    : null;

  return {
    covenantDSCR,
    yearendEbitda,
    ttmEbitda,
    lastQuarterEbitda,
    sections: [
      {
        key: 'yearend',
        title: 'Last Yearend',
        badge: null,
        ebitda: yearendEbitda,
        totalDebtService: annualDebtService,
        dscr: yearendDscr,
        covenantDSCR,
      },
      {
        key: 'ttm',
        title: 'Last four Quarters',
        badge: null,
        ebitda: ttmEbitda,
        totalDebtService: ttmTotalDebtService,
        dscr: ttmDscr,
        covenantDSCR,
      },
      {
        key: 'lastQuarter',
        title: 'Last Quarter',
        badge: hasQuarterlyIncomeFinancials
          ? formatQuarterBadge(lastQuarterFinancial?.asOfDate)
          : null,
        ebitda: lastQuarterEbitda,
        totalDebtService: lastQuarterTotalDebtService,
        dscr: lastQuarterDscr,
        covenantDSCR,
        lastQuarterUsesQuarterlyFinancials: hasQuarterlyIncomeFinancials,
      },
    ],
  };
};

/**
 * EBITDA previous/current pairs for the Triggers tab — uses the same financial selection
 * as {@link buildQuarterlyDebtServiceSummary} (Last Quarter + TTM, not ×4 run-rate).
 */
export const buildEbitdaTriggerComparison = ({
  financialsList = [],
  currentFinancial = null,
  previousFinancial = null,
}) => {
  const dscrAfterYearend = tryYearendToQuarterlyDscrComparison(currentFinancial, previousFinancial);
  if (dscrAfterYearend) {
    return {
      showEbitdaCard: true,
      ...dscrAfterYearend,
    };
  }

  const showQuarterlyEbitdaCard = hasTwoConsecutiveQuartersWithEbitda(financialsList);
  if (!showQuarterlyEbitdaCard) {
    const isQuarterlyContext = Boolean(currentFinancial?.incomeStatementPackageQuarterly)
      || Boolean(previousFinancial?.incomeStatementPackageQuarterly);
    if (!isQuarterlyContext) {
      return {
        showEbitdaCard: true,
        useQuarterlySections: false,
        reportedPrevious: parseEbitda(previousFinancial),
        reportedCurrent: parseEbitda(currentFinancial),
      };
    }
    return { showEbitdaCard: false };
  }

  const isQuarterlyContext = Boolean(currentFinancial?.incomeStatementPackageQuarterly)
    || Boolean(previousFinancial?.incomeStatementPackageQuarterly);

  if (!isQuarterlyContext) {
    return {
      showEbitdaCard: true,
      useQuarterlySections: false,
      reportedPrevious: parseEbitda(previousFinancial),
      reportedCurrent: parseEbitda(currentFinancial),
    };
  }

  const summary = buildQuarterlyDebtServiceSummary({
    financialsList,
    totalMonthlyPayment: null,
    loans: [],
  });

  const sorted = sortFinancialsByAsOfDesc(financialsList);
  const quarterlyFinancials = sorted.filter(
    (f) => Boolean(f.incomeStatementPackageQuarterly) && parseEbitda(f) != null,
  );
  const priorQuarterFinancial = quarterlyFinancials[1] ?? null;

  return {
    showEbitdaCard: true,
    useQuarterlySections: true,
    reportedSectionTitle: 'Last Quarter',
    estimatedSectionTitle: 'Last four Quarters (TTM)',
    reportedPrevious: parseEbitda(priorQuarterFinancial),
    reportedCurrent: summary.lastQuarterEbitda,
    estimatedPrevious: sumEbitdaFromFinancials(quarterlyFinancials.slice(1, 5)),
    estimatedCurrent: summary.ttmEbitda,
  };
};
