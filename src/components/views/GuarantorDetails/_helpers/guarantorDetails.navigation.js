/** Default route when there is no in-app history to go back to (e.g. opened `/guarantors/:id` directly). */
export const GUARANTOR_DETAIL_BACK_FALLBACK = '/dashboard';

/**
 * Prefer browser back when the stack has a prior entry; otherwise go to a safe in-app route.
 * React Router may set `history.state.idx` (0 = first entry in this tab); if missing, `history.length` is used.
 *
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {string} [fallbackPath]
 */
export const navigateBackOrDefault = (navigate, fallbackPath = GUARANTOR_DETAIL_BACK_FALLBACK) => {
  if (typeof window === 'undefined') {
    navigate(fallbackPath);
    return;
  }
  const idx = window.history.state?.idx;
  if (idx === 0) {
    navigate(fallbackPath);
    return;
  }
  if (idx > 0) {
    navigate(-1);
    return;
  }
  if (window.history.length <= 1) {
    navigate(fallbackPath);
    return;
  }
  navigate(-1);
};
