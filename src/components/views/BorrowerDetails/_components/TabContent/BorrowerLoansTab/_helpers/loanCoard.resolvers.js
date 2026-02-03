/* eslint-disable import/prefer-default-export */
import loansApi from '@src/api/loans.api';
import { $borrower } from '@src/consts/consts';
import { $loanWatchScoreBreakdowns } from './loanCard.consts';

export const fetchLoanWatchScoreBreakdowns = async () => {
  $loanWatchScoreBreakdowns.update({ isLoading: true });
  if (!$borrower.value?.borrower?.loans || $borrower.value?.borrower?.loans?.length === 0) {
    $loanWatchScoreBreakdowns.update({ breakdowns: {}, isLoading: false });
    return;
  }

  try {
    const breakdownPromises = $borrower.value?.borrower?.loans?.map((loan) => loansApi.getWatchScoreBreakdown(loan.id).catch((error) => {
      console.warn(`Failed to fetch Watch Score breakdown for loan ${loan.id}:`, error);
      return null;
    }));

    const breakdownResponses = await Promise.all(breakdownPromises);

    const breakdownsMap = {};
    $borrower.value?.borrower?.loans?.forEach((loan, index) => {
      const response = breakdownResponses[index];
      const breakdownData = response?.data || response;
      if (breakdownData) {
        breakdownsMap[loan.id] = breakdownData;
      }
    });

    $loanWatchScoreBreakdowns.update({ breakdowns: breakdownsMap, isLoading: false });
  } catch (error) {
    console.error('Failed to fetch loan Watch Score breakdowns:', error);
    $loanWatchScoreBreakdowns.update({ breakdowns: {}, isLoading: false });
  }
};
