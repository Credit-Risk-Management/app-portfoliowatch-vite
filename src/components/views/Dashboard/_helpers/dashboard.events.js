export const handlePieClick = (data, navigate) => {
  if (data && data.rating) {
    navigate(`/loans?riskRating=${data.rating}`);
  }
};

export const handleMetricCardClick = (path) => {
  window.location.href = path;
};
