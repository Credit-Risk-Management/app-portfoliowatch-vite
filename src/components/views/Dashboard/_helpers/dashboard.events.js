export const handlePieClick = (data, navigate) => {
  if (!data || !navigate) return;

  // Recharts passes data in payload property
  const payload = data.payload || data;
  let rating = payload.rating !== undefined && payload.rating !== null
    ? payload.rating
    : null;

  // If rating is null, try to extract it from the name field (e.g., "WATCH 1" -> 1)
  if (rating === null || rating === undefined) {
    const name = payload.name || '';
    const watchMatch = name.match(/WATCH\s+(\d+)/i);
    if (watchMatch) {
      rating = parseInt(watchMatch[1], 10);
    }
  }

  // If still no rating, try to match by fill color
  if (rating === null || rating === undefined) {
    const fillColor = payload.fill || data.fill;
    // Match color to rating: #7EEF86=1, #7CE4F0=2, #A07CF0=3, #F6B366=4, #F66666=5
    const colorToRating = {
      '#7EEF86': 1, // Winning
      '#7CE4F0': 2, // Anchor
      '#A07CF0': 3, // Typical
      '#F6B366': 4, // Concerning
      '#F66666': 5, // High Risk
    };
    if (fillColor && colorToRating[fillColor]) {
      rating = colorToRating[fillColor];
    }
  }

  // Navigate if we have a valid rating (1-5, not null/undefined)
  if (rating !== null && rating !== undefined && rating >= 1 && rating <= 5) {
    navigate(`/loans?watchScore=${rating}`);
  }
};

export const handleMetricCardClick = (path) => {
  window.location.href = path;
};
