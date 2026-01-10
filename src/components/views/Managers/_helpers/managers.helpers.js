export const getManagerName = (managerId, managers) => {
  if (!managerId) return '-';
  const manager = managers.find((m) => m.id === managerId);
  return manager ? manager.name : '-';
};

export const getDirectReports = (managerId, managers) => managers.filter((m) => m.managerId === managerId);

export const getReportsCount = (managerId, managers) => {
  const reports = getDirectReports(managerId, managers);
  return reports.length;
};

export const parseStatusFilter = (value) => {
  if (value === 'active') return true;
  if (value === 'inactive') return false;
  return '';
};

export const getManagerOptionsWithNone = (managers, excludeId = null) => {
  const filteredManagers = managers.filter((m) => m.isActive && m.id !== excludeId);
  const managerOptions = filteredManagers.map((m) => ({
    value: m.id,
    label: `${m.name} - ${m.positionTitle}`,
  }));

  return [
    { value: '', label: 'None (Top Level)' },
    ...managerOptions,
  ];
};
