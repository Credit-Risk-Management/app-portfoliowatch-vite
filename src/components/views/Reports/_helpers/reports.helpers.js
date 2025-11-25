import { formatCurrency } from '@src/utils/formatCurrency';

export const getRelationshipManagerName = (managerId, managers) => {
  const manager = managers.find((m) => m.id === managerId);
  return manager ? manager.name : '-';
};

export const formatRatio = (value) => {
  if (value === null || value === undefined) return '-';
  return Number(value).toFixed(2);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

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

export const formatLoansForTable = (loans, managers) => 
  loans.map((loan) => ({
    ...loan,
    principal_amount: formatCurrency(loan.principalAmount),
    payment_amount: formatCurrency(loan.paymentAmount),
    next_payment_due_date: formatDate(loan.nextPaymentDueDate),
    debt_service: formatRatio(loan.debtService),
    current_ratio: formatRatio(loan.currentRatio),
    liquidity: formatCurrency(loan.liquidity),
    relationship_manager: getRelationshipManagerName(loan.relationshipManagerId, managers),
  }));

