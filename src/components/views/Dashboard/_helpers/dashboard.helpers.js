export const calculatePortfolioValue = (loans) => loans.reduce((sum, loan) => sum + parseFloat(loan.principalAmount || 0), 0);

export const calculateRiskRatingData = (loans) => {
  const watchScoreCounts = {};
  const watchScoreAmounts = {};

  loans.forEach((loan) => {
    const score = loan.watchScore;
    if (score !== null && score !== undefined) {
      watchScoreCounts[score] = (watchScoreCounts[score] || 0) + 1;
      watchScoreAmounts[score] = (watchScoreAmounts[score] || 0) + parseFloat(loan.principalAmount || 0);
    }
  });

  const riskRatingCountData = Object.keys(watchScoreCounts).map((score) => ({
    name: `Score ${score}`,
    value: watchScoreCounts[score],
    rating: parseFloat(score),
  }));

  const riskRatingAmountData = Object.keys(watchScoreAmounts).map((score) => ({
    name: `Score ${score}`,
    value: watchScoreAmounts[score],
    rating: parseFloat(score),
  }));

  return { riskRatingCountData, riskRatingAmountData };
};
