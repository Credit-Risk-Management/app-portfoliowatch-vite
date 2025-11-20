import { $dashboard, $borrowers, $loans } from '@src/signals';
import borrowersApi from '@src/api/borrowers.api';
import loansApi from '@src/api/loans.api';
import * as helpers from './dashboard.helpers';

export const loadDashboardData = async () => {
  $dashboard.update({ isLoading: true });

  try {
    const [borrowersResponse, loansResponse] = await Promise.all([
      borrowersApi.getAll(),
      loansApi.getAll(),
    ]);

    const borrowers = borrowersResponse.data || [];
    const loans = loansResponse.data || [];

    $borrowers.update({ list: borrowers });
    $loans.update({ list: loans });

    const portfolioValue = helpers.calculatePortfolioValue(loans);
    const { riskRatingCountData, riskRatingAmountData } = helpers.calculateRiskRatingData(loans);

    $dashboard.update({
      metrics: {
        totalClients: borrowers.length,
        portfolioValue,
        riskRatingCountData,
        riskRatingAmountData,
      },
      isLoading: false,
    });
  } catch (error) {
    $dashboard.update({ isLoading: false });
  }
};

