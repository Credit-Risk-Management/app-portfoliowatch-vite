import colors from '@src/scss/exportVars.module.scss';

export const RISK_RATING_LABELS = {
  1: '1 - Minimal Risk',
  2: '2 - Low Risk',
  3: '3 - Moderate Risk',
  4: '4 - Elevated Risk',
  5: '5 - High Risk',
};

export const RISK_RATING_COLORS = {
  1: '#28a745', // green
  2: '#20c997', // teal
  3: '#ffc107', // yellow
  4: '#fd7e14', // orange
  5: '#dc3545', // red
};

// WATCH Score color mapping - maps score ranges to colors
// Uses SCSS theme colors that will automatically update if SCSS variables change
export const getWatchScoreColor = (watchScore) => {
  if (watchScore === null || watchScore === undefined) {
    return colors.grey || '#6B7280'; // grey for no score
  }
  
  const score = typeof watchScore === 'number' ? watchScore : parseFloat(watchScore);
  
  // Round to nearest integer for color mapping
  // Mapping: 1 → secondary, 2 → info, 3 → primary, 4 → warning, 5+ → danger
  const roundedScore = Math.round(score);
  
  if (roundedScore === 1) {
    return colors.secondary || '#D8EF7E'; // secondary
  } else if (roundedScore === 2) {
    return colors.info || '#7CE4F0'; // info
  } else if (roundedScore === 3) {
    return colors.primary || '#A07CF0'; // primary
  } else if (roundedScore === 4) {
    return colors.warning || '#F6B366'; // warning
  } else if (roundedScore >= 5) {
    return colors.danger || '#F66666'; // danger
  } else {
    // Fallback for scores < 1 (shouldn't happen, but just in case)
    return colors.secondary || '#D8EF7E';
  }
};

