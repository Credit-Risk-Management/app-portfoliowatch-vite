import { WATCH_SCORE_OPTIONS } from '@src/consts/consts';
import colors from '@src/scss/exportVars.module.scss';

export const RISK_RATING_LABELS = {
  1: WATCH_SCORE_OPTIONS[1].label,
  2: WATCH_SCORE_OPTIONS[2].label,
  3: WATCH_SCORE_OPTIONS[3].label,
  4: WATCH_SCORE_OPTIONS[4].label,
  5: WATCH_SCORE_OPTIONS[5].label,
};

export const RISK_RATING_COLORS = {
  1: WATCH_SCORE_OPTIONS[1].color, // green
  2: WATCH_SCORE_OPTIONS[2].color, // teal
  3: WATCH_SCORE_OPTIONS[3].color, // yellow
  4: WATCH_SCORE_OPTIONS[4].color, // orange
  5: WATCH_SCORE_OPTIONS[5].color, // red
};

// WATCH Score color mapping - maps score ranges to colors
// Uses SCSS theme colors that will automatically update if SCSS variables change
export const getWatchScoreColor = (watchScore) => {
  if (watchScore === null || watchScore === undefined) {
    return WATCH_SCORE_OPTIONS.null.color; // grey for no score
  }
  return WATCH_SCORE_OPTIONS[watchScore].color;
};
