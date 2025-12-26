/* eslint-disable import/prefer-default-export */
import { $dashboard, $borrowers, $comments } from '@src/signals';
import borrowersApi from '@src/api/borrowers.api';
import loansApi from '@src/api/loans.api';
import commentsApi from '@src/api/comments.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';

export const loadDashboardData = async () => {
  $dashboard.update({ isLoading: true });
  $comments.update({ isLoading: true });

  try {
    const [borrowersResponse, loanMetricsResponse, recentLoansResponse, commentsResponse] = await Promise.all([
      borrowersApi.getAll(),
      loansApi.getLoanMetrics(),
      loansApi.getRecent(8),
      commentsApi.getAll(),
    ]);

    const borrowers = borrowersResponse.data || [];
    const loanMetrics = loanMetricsResponse.data || {};
    const recentLoans = recentLoansResponse.data || [];
    const comments = commentsResponse.data || [];

    $borrowers.update({ list: borrowers });

    // Sort comments by created_at descending and take the most recent 5
    const recentComments = comments
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    $comments.update({ list: recentComments, isLoading: false });

    // Transform backend metrics to frontend format
    const watchScoreMetrics = loanMetrics.watchScoreMetrics || [];
    const watchScoreCountData = watchScoreMetrics.map((metric) => ({
      name: metric.watchScore !== null ? `WATCH ${metric.watchScore}` : 'No Score',
      value: metric.count,
      rating: metric.watchScore,
    }));

    const watchScoreAmountData = watchScoreMetrics.map((metric) => ({
      name: metric.watchScore !== null ? `WATCH ${metric.watchScore}` : 'No Score',
      value: metric.totalAmount,
      rating: metric.watchScore,
    }));

    $dashboard.update({
      metrics: {
        totalClients: borrowersResponse.count || 0,
        portfolioValue: loanMetrics.totalPortfolioValue || 0,
        watchScoreCountData: watchScoreCountData || [],
        watchScoreAmountData: watchScoreAmountData || [],
        activeLoans: loanMetrics.totalActiveLoans || 0,
        totalBorrowers: borrowersResponse.count || 0,
      },
      recentLoans,
      isLoading: false,
    });
  } catch (error) {
    dangerAlert(error.message || 'Failed to load dashboard data');
    $comments.update({ isLoading: false });
  } finally {
    $dashboard.update({ isLoading: false });
  }
};
