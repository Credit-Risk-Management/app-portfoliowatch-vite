import { formatCurrency } from '@src/utils/formatCurrency';
import { formatRatio } from '@src/utils/formatRatio';
import { formatDateNumeric as formatDate } from '@src/utils/formatDate';
import { getManagerName as getRelationshipManagerName } from '@src/utils/relationshipManagers.utils';

export { formatRatio, formatDate, getRelationshipManagerName };

export const applyFilters = (loans, filters) => {
  let filteredLoans = [...loans];

  if (filters.searchTerm) {
    filteredLoans = filteredLoans.filter(
      (loan) => loan.borrowerName?.toLowerCase().includes(filters.searchTerm.toLowerCase())
        || loan.loanNumber?.toLowerCase().includes(filters.searchTerm.toLowerCase())
        || loan.industry?.toLowerCase().includes(filters.searchTerm.toLowerCase()),
    );
  }

  if (filters.interestType) {
    filteredLoans = filteredLoans.filter((loan) => loan.typeOfInterest === filters.interestType);
  }

  if (filters.watchScore) {
    filteredLoans = filteredLoans.filter((loan) => parseFloat(loan.watchScore) === parseFloat(filters.watchScore));
  }

  if (filters.relationshipManager) {
    filteredLoans = filteredLoans.filter((loan) => loan.relationshipManagerId === filters.relationshipManager);
  }

  return filteredLoans;
};

export const formatLoansForTable = (loans, managers) => loans.map((loan) => ({
  ...loan,
  principal_amount: formatCurrency(loan.principalAmount),
  payment_amount: formatCurrency(loan.paymentAmount),
  next_payment_due_date: formatDate(loan.nextPaymentDueDate),
  debt_service: formatRatio(loan.debtService),
  current_ratio: formatRatio(loan.currentRatio),
  liquidity: formatCurrency(loan.liquidity),
  relationship_manager: getRelationshipManagerName(loan.relationshipManagerId, managers),
}));
