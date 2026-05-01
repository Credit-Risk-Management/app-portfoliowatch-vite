/**
 * Source of truth: `notes` on GuarantorFinancial.
 * True when values were sourced from a lender/credit memo (not a submitted PFS), e.g. Sensible extraction:
 * "Extracted from lender memo via Sensible on 2026-03-12 || ..."
 */
export const isNetWorthFromCreditMemoNotes = (notes) => {
  if (notes == null || typeof notes !== 'string') return false;
  const n = notes.trim().toLowerCase();
  if (!n) return false;
  return (
    n.includes('lender memo')
    || n.includes('credit memo')
    || n.includes('credit-memo')
  );
};

export const getLatestGuarantorFinancial = (financials) => {
  if (!Array.isArray(financials) || financials.length === 0) return null;
  return [...financials].sort((a, b) => new Date(b.asOfDate) - new Date(a.asOfDate))[0];
};
