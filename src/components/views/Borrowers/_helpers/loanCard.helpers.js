import { WATCH_SCORE_OPTIONS } from '@src/consts/consts';

export const getWatchScoreDisplay = (score) => {
  if (score == null || score === undefined) {
    return WATCH_SCORE_OPTIONS.null;
  }
  const roundedScore = Math.round(score);
  return WATCH_SCORE_OPTIONS[roundedScore] || WATCH_SCORE_OPTIONS.null;
};

export const getCategoryColor = (score) => {
  if (score == null || score === undefined) {
    return 'secondary';
  }
  if (score <= 2) return 'success';
  if (score === 3) return 'info';
  if (score === 4) return 'warning';
  return 'danger';
};

export const formatCategoryBreakdown = (breakdown) => {
  if (!breakdown || !breakdown.categories) {
    return [];
  }

  const categories = breakdown.categories;
  
  const categoryArray = Object.entries(categories).map(([categoryName, categoryData]) => ({
    letter: categoryData.letter,
    name: formatCategoryName(categoryName),
    score: categoryData.score,
    color: getCategoryColor(categoryData.score),
    weight: categoryData.weight,
    hasData: categoryData.score !== null,
  }));

  const watchOrder = ['W', 'A', 'T', 'C', 'H'];
  categoryArray.sort((a, b) => {
    const indexA = watchOrder.indexOf(a.letter);
    const indexB = watchOrder.indexOf(b.letter);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return categoryArray;
};

const formatCategoryName = (name) => {
  const nameMap = {
    'Weighted Exposure': 'Weighted Exposure',
    'AccountabilityScore': 'Accountability',
    'Triggers': 'Triggers',
    'Collateral': 'Collateral',
    'Headwinds': 'Headwinds',
  };

  if (nameMap[name]) {
    return nameMap[name];
  }

  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
    .replace(/Score$/, '');
};

export const hasWatchScoreData = (loan) => {
  return loan?.currentWatchScore != null;
};
