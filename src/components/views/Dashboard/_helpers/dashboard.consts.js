import { WATCH_SCORE_OPTIONS } from '@src/consts/consts';

// Color mapping from Bootstrap class names to hex values
// These match the SCSS variables in _vars.scss
const COLOR_HEX_MAP = {
  success: '#7EEF86',   // WATCH Score 1 - Winning
  info: '#7CE4F0',       // WATCH Score 2 - Anchor
  primary: '#A07CF0',    // WATCH Score 3 - Typical
  warning: '#F6B366',    // WATCH Score 4 - Concerning
  danger: '#F66666',     // WATCH Score 5 - High Risk
  secondary: '#6B7280',  // No score (grey)
};

export const RISK_RATING_LABELS = {
  1: WATCH_SCORE_OPTIONS[1].label,
  2: WATCH_SCORE_OPTIONS[2].label,
  3: WATCH_SCORE_OPTIONS[3].label,
  4: WATCH_SCORE_OPTIONS[4].label,
  5: WATCH_SCORE_OPTIONS[5].label,
};

export const RISK_RATING_COLORS = {
  1: COLOR_HEX_MAP[WATCH_SCORE_OPTIONS[1].color] || COLOR_HEX_MAP.success, // green
  2: COLOR_HEX_MAP[WATCH_SCORE_OPTIONS[2].color] || COLOR_HEX_MAP.info, // teal
  3: COLOR_HEX_MAP[WATCH_SCORE_OPTIONS[3].color] || COLOR_HEX_MAP.primary, // yellow
  4: COLOR_HEX_MAP[WATCH_SCORE_OPTIONS[4].color] || COLOR_HEX_MAP.warning, // orange
  5: COLOR_HEX_MAP[WATCH_SCORE_OPTIONS[5].color] || COLOR_HEX_MAP.danger, // red
};

// WATCH Score color mapping - maps score ranges to hex colors
// Uses SCSS theme colors that will automatically update if SCSS variables change
export const getWatchScoreColor = (watchScore) => {
  if (watchScore === null || watchScore === undefined) {
    const colorName = WATCH_SCORE_OPTIONS.null.color;
    return COLOR_HEX_MAP[colorName] || COLOR_HEX_MAP.secondary;
  }
  const colorName = WATCH_SCORE_OPTIONS[watchScore]?.color;
  return COLOR_HEX_MAP[colorName] || COLOR_HEX_MAP.secondary;
};
