import { $relationshipManagers, $loans } from '@src/signals';

export const getManagerName = (managerId, managers) => {
  if (!managerId) return '-';
  const manager = managers.find((m) => m.id === managerId);
  return manager ? manager.name : '-';
};

export const getDirectReports = (managerId, managers) => 
  managers.filter((m) => m.manager_id === managerId);

export const getReportsCount = (managerId, managers) => {
  const reports = getDirectReports(managerId, managers);
  return reports.length;
};

export const getAllReportsRecursive = (managerId, managers) => {
  const directReports = getDirectReports(managerId, managers);
  const allReports = [...directReports];
  directReports.forEach((report) => {
    allReports.push(...getAllReportsRecursive(report.id, managers));
  });
  return allReports;
};

export const getLoansCount = (managerId, managers, loans, includeTeam = true) => {
  if (!includeTeam) {
    return loans.filter((loan) => loan.loan_officer_id === managerId).length;
  }

  const teamMembers = [managerId, ...getAllReportsRecursive(managerId, managers).map((m) => m.id)];
  return loans.filter((loan) => teamMembers.includes(loan.loan_officer_id)).length;
};

export const parseStatusFilter = (value) => {
  if (value === 'active') return true;
  if (value === 'inactive') return false;
  return '';
};

export const getManagerOptionsWithNone = (managers, excludeId = null) => {
  const filteredManagers = managers.filter((m) => m.is_active && m.id !== excludeId);
  const managerOptions = filteredManagers.map((m) => ({
    value: m.id,
    label: `${m.name} - ${m.position_title}`,
  }));
  
  return [
    { value: '', label: 'None (Top Level)' },
    ...managerOptions,
  ];
};

