/* eslint-disable import/prefer-default-export */
import loansApi from '@src/api/loans.api';
import borrowersApi from '@src/api/borrowers.api';
import commentsApi from '@src/api/comments.api';
import relationshipManagersApi from '@src/api/relationshipManagers.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $managerDetail } from '@src/signals';

export const loadManagerDetailData = async (managerId) => {
  try {
    // Fetch manager-specific data
    const [managerResponse, loansResponse, borrowersResponse, commentsResponse, managersResponse] = await Promise.all([
      relationshipManagersApi.getById(managerId),
      loansApi.getByRelationshipManager(managerId),
      borrowersApi.getAll(),
      commentsApi.getAll(),
      relationshipManagersApi.getAll(),
    ]);

    const manager = managerResponse.data || managerResponse;
    const loans = loansResponse.data || [];
    const borrowers = borrowersResponse.data || [];
    const allComments = commentsResponse.data || [];
    const allManagers = managersResponse.data || [];

    // Filter borrowers for this manager
    const managerBorrowers = borrowers.filter(
      (borrower) => borrower.relationship_manager_id === managerId,
    );

    // Get loan IDs for this manager
    const loanIds = new Set(loans.map((loan) => loan.id));

    // Filter comments to only those on this manager's loans
    const managerComments = allComments
      .filter((comment) => loanIds.has(comment.loan_id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    // Get recent loans (last 8 sorted by updated_at)
    const recentLoans = [...loans]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 8);

    // Calculate metrics
    const portfolioValue = loans.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0);
    const totalBorrowers = managerBorrowers.length;
    const activeLoans = loans.length;

    // Calculate WATCH score distribution
    const watchScoreCounts = {};
    const watchScoreAmounts = {};

    loans.forEach((loan) => {
      const score = loan.watchScore;
      if (score !== null && score !== undefined) {
        watchScoreCounts[score] = (watchScoreCounts[score] || 0) + 1;
        watchScoreAmounts[score] = (watchScoreAmounts[score] || 0) + parseFloat(loan.principalAmount || 0);
      }
    });

    // Format data for pie charts (matching Dashboard format)
    const watchScoreCountData = Object.keys(watchScoreCounts)
      .sort((a, b) => Number(a) - Number(b))
      .map((score) => ({
        name: `WATCH ${score}`,
        value: watchScoreCounts[score],
        rating: parseFloat(score),
      }));

    const watchScoreAmountData = Object.keys(watchScoreAmounts)
      .sort((a, b) => Number(a) - Number(b))
      .map((score) => ({
        name: `WATCH ${score}`,
        value: watchScoreAmounts[score],
        rating: parseFloat(score),
      }));

    $managerDetail.value = {
      manager,
      loans,
      borrowers: managerBorrowers,
      comments: managerComments,
      recentLoans,
      allManagers,
      metrics: {
        portfolioValue,
        totalBorrowers,
        activeLoans,
        watchScoreCountData,
        watchScoreAmountData,
      },
    };
  } catch (error) {
    dangerAlert(error.message || 'Failed to load manager detail data');
    throw error;
  }
};
