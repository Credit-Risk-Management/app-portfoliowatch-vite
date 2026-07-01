import { COMPLIANCE_FILTER_GROUPS } from './borrowers.consts';

export { getManagerName, getManagerOptions } from '@src/utils/relationshipManagers.utils';

export const hasActiveComplianceFilters = (filterValue) => COMPLIANCE_FILTER_GROUPS.some(
  (group) => ['true', 'false'].includes(filterValue?.[group.key]),
);

export const getComplianceFilterSummary = (filterValue) => {
  const active = COMPLIANCE_FILTER_GROUPS.flatMap((group) => {
    const selected = filterValue?.[group.key];
    if (!['true', 'false'].includes(selected)) return [];
    const option = group.options.find((entry) => entry.value === selected);
    if (!option) return [];
    return [`${group.shortLabel}: ${option.label}`];
  });

  if (active.length === 0) return 'Compliance';
  if (active.length === 1) return active[0];
  return `Compliance (${active.length})`;
};
