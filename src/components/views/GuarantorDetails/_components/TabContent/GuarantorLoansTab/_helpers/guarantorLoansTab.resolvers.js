/* eslint-disable import/prefer-default-export */
import loansApi from '@src/api/loans.api';
import { $guarantorsLoansView } from './guarantorLoansTab.consts';

export const fetchLoanWatchScoreBreakdowns = async (loans) => {
  if (!loans || loans.length === 0) {
    $guarantorsLoansView.update({ breakdowns: {}, isLoading: false });
    return;
  }

  try {
    $guarantorsLoansView.update({ isLoading: true });

    const breakdownPromises = loans.map((loan) => loansApi.getWatchScoreBreakdown(loan.id).catch((error) => {
      console.warn(`Failed to fetch Watch Score breakdown for loan ${loan.id}:`, error);
      return null;
    }));

    const breakdownResponses = await Promise.all(breakdownPromises);

    const breakdownsMap = {};
    loans.forEach((loan, index) => {
      const response = breakdownResponses[index];
      const breakdownData = response?.data || response;
      if (breakdownData) {
        breakdownsMap[loan.id] = breakdownData;
      }
    });

    $guarantorsLoansView.update({ breakdowns: breakdownsMap, isLoading: false });
  } catch (error) {
    console.error('Failed to fetch loan Watch Score breakdowns:', error);
    $guarantorsLoansView.update({ breakdowns: {}, isLoading: false });
  }
};
