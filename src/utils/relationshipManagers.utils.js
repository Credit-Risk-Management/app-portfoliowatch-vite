export const getManagerName = (managerId, managers = []) => {
  if (!managerId) return '-';
  const manager = managers.find((m) => m.id === managerId);
  return manager ? manager.name : '-';
};

export const getManagerOptions = (managers = []) => managers.map((m) => ({
  value: m.id,
  label: m.name,
}));

/** Loan forms: tolerate nested relationshipManager on list items. */
export const getRelationshipManagerOptions = (managers = []) => managers.map((m) => ({
  value: m.id,
  label: m.name || m.relationshipManager?.name || 'Unknown',
}));

/** @deprecated use getManagerName */
export const getRelationshipManagerName = getManagerName;

export default getManagerName;
