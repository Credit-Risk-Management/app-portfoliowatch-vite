/**
 * Build URL query params from a table $filter signal value.
 * Omits empty strings, arrays, objects, and undefined so URLs stay clean
 * (e.g. no borrowerType=&riskRating= from multi-select / unused fields).
 */
export function filterValueToUrlSearchParams(filterValue) {
  const params = new URLSearchParams();
  if (!filterValue || typeof filterValue !== 'object') return params;

  Object.entries(filterValue).forEach(([key, val]) => {
    if (val === undefined || val === null) return;
    if (Array.isArray(val)) return;
    if (typeof val === 'object') return;

    if (typeof val === 'string') {
      if (val.trim() === '') return;
      params.set(key, val);
      return;
    }

    if (typeof val === 'number') {
      if (Number.isNaN(val)) return;
      if (key === 'page' && val === 1) return;
      params.set(key, String(val));
      return;
    }

    if (typeof val === 'boolean') {
      params.set(key, val ? '1' : '0');
    }
  });

  return params;
}

/**
 * Borrowers list: same as {@link filterValueToUrlSearchParams} plus multi-select facets so
 * "Back to Borrowers" and localStorage stay aligned with $borrowersFilter.
 */
export function borrowersFilterToUrlParams(filterValue) {
  const params = filterValueToUrlSearchParams(filterValue);
  if (!filterValue || typeof filterValue !== 'object') return params;

  const bt = filterValue.borrowerType;
  if (Array.isArray(bt) && bt.length) {
    params.set('borrowerType', bt.filter(Boolean).join(','));
  }

  const rm = filterValue.relationshipManager;
  if (Array.isArray(rm) && rm.length) {
    params.set('relationshipManager', rm.filter(Boolean).join(','));
  }

  return params;
}
