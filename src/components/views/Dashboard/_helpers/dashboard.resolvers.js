/* eslint-disable import/prefer-default-export */
import { $dashboard, $borrowers, $comments } from '@src/signals';
import borrowersApi from '@src/api/borrowers.api';
import loansApi from '@src/api/loans.api';
import commentsApi from '@src/api/comments.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { WATCH_SCORE_OPTIONS } from '@src/consts/consts';

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

    // Create a map of existing metrics by watchScore for quick lookup
    // Convert watchScore to number to ensure type consistency
    const metricsMap = new Map();
    watchScoreMetrics.forEach((metric) => {
      if (metric.watchScore !== null && metric.watchScore !== undefined) {
        const score = Number(metric.watchScore);
        if (!Number.isNaN(score)) {
          metricsMap.set(score, metric);
        }
      }
    });

    // Always include all 5 risk scores (1-5) with 0 values for missing scores
    const watchScoreCountData = [];
    const watchScoreAmountData = [];

    for (let score = 1; score <= 5; score++) {
      const metric = metricsMap.get(score);
      const label = WATCH_SCORE_OPTIONS[score]?.label || `${score} - Unknown`;
      
      watchScoreCountData.push({
        name: label,
        value: metric?.count || 0,
        rating: score,
      });

      watchScoreAmountData.push({
        name: label,
        value: metric?.totalAmount || 0,
        rating: score,
      });
    }

    // riskRatingCountData and riskRatingAmountData are aliases for watchScoreCountData/watchScoreAmountData
    // Always include all 5 scores (1-5) with proper labels
    $dashboard.update({
      metrics: {
        totalClients: borrowersResponse.count || 0,
        portfolioValue: loanMetrics.totalPortfolioValue || 0,
        watchScoreCountData: watchScoreCountData || [],
        watchScoreAmountData: watchScoreAmountData || [],
        riskRatingCountData: watchScoreCountData || [],
        riskRatingAmountData: watchScoreAmountData || [],
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
