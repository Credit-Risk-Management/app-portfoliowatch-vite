import { RISK_RATING_LABELS } from './dashboard.consts';

export const calculatePortfolioValue = (loans) => loans.reduce((sum, loan) => sum + parseFloat(loan.principal_amount || 0), 0);

export const calculateRiskRatingData = (loans) => {
  const riskRatingCounts = {};
  const riskRatingAmounts = {};

  loans.forEach((loan) => {
    const rating = loan.current_risk_rating;
    riskRatingCounts[rating] = (riskRatingCounts[rating] || 0) + 1;
    riskRatingAmounts[rating] = (riskRatingAmounts[rating] || 0) + parseFloat(loan.principal_amount || 0);
  });

  const riskRatingCountData = Object.keys(riskRatingCounts).map((rating) => ({
    name: RISK_RATING_LABELS[rating],
    value: riskRatingCounts[rating],
    rating: parseInt(rating, 10),
  }));

  const riskRatingAmountData = Object.keys(riskRatingAmounts).map((rating) => ({
    name: RISK_RATING_LABELS[rating],
    value: riskRatingAmounts[rating],
    rating: parseInt(rating, 10),
  }));

  return { riskRatingCountData, riskRatingAmountData };
};
