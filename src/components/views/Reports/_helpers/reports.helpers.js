import { formatCurrency } from '@src/utils/formatCurrency';

export const getLoanOfficerName = (officerId, managers) => {
  const officer = managers.find((m) => m.id === officerId);
  return officer ? officer.name : '-';
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
      (loan) => loan.borrower_name?.toLowerCase().includes(filters.searchTerm.toLowerCase())
        || loan.loan_number?.toLowerCase().includes(filters.searchTerm.toLowerCase())
        || loan.industry?.toLowerCase().includes(filters.searchTerm.toLowerCase()),
    );
  }

  if (filters.interestType) {
    filteredLoans = filteredLoans.filter((loan) => loan.type_of_interest === filters.interestType);
  }

  if (filters.riskRating) {
    filteredLoans = filteredLoans.filter((loan) => loan.current_risk_rating === filters.riskRating);
  }

  if (filters.loanOfficer) {
    filteredLoans = filteredLoans.filter((loan) => loan.loan_officer_id === filters.loanOfficer);
  }

  return filteredLoans;
};

export const formatLoansForTable = (loans, managers) => 
  loans.map((loan) => ({
    ...loan,
    principal_amount: formatCurrency(loan.principal_amount),
    payment_amount: formatCurrency(loan.payment_amount),
    next_payment_due_date: formatDate(loan.next_payment_due_date),
    debt_service: formatRatio(loan.debt_service),
    current_ratio: formatRatio(loan.current_ratio),
    liquidity: formatCurrency(loan.liquidity),
    loan_officer: getLoanOfficerName(loan.loan_officer_id, managers),
  }));

