import loansApi from '@src/api/loans.api';
import { $borrowerGuarantorModal } from '../../../../_helpers/borrowerDetail.consts';

const loanOptionLabelCache = new Map();

export const seedGuarantorModalLoanLabels = (loans = []) => {
  loanOptionLabelCache.clear();
  (loans || []).forEach((loan) => {
    if (loan?.id) {
      const label = loan.loanId || loan.loanNumber || loan.loanName || loan.id;
      loanOptionLabelCache.set(loan.id, label);
    }
  });
};

export const clearGuarantorModalLoanOptionCache = () => {
  loanOptionLabelCache.clear();
};

export const getGuarantorModalLoanLabel = (id) => loanOptionLabelCache.get(id) || id;

const loanToAsyncOption = (loan) => ({
  value: loan.id,
  label: loan.loanId || loan.loanNumber || loan.loanName || loan.id,
});

/**
 * AsyncSelect loadOptions for guarantor loan picker (scoped to modal’s borrower).
 */
export const loadGuarantorModalLoanOptions = async (inputValue) => {
  const borrowerId = $borrowerGuarantorModal.value?.loanPickerBorrowerId;
  if (!borrowerId) return [];

  let loans = [];
  try {
    const res = await loansApi.getByBorrower(borrowerId);
    const raw = res?.data;
    loans = Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }

  const q = (inputValue || '').trim().toLowerCase();
  const filtered = q
    ? loans.filter((loan) => {
      const lid = String(loan.loanId || '').toLowerCase();
      const num = String(loan.loanNumber || '').toLowerCase();
      const nm = String(loan.loanName || '').toLowerCase();
      return lid.includes(q) || num.includes(q) || nm.includes(q);
    })
    : loans;

  filtered.forEach((loan) => {
    if (loan?.id) {
      loanOptionLabelCache.set(loan.id, loanToAsyncOption(loan).label);
    }
  });

  return filtered.map(loanToAsyncOption);
};
