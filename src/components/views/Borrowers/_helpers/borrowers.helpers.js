export const getManagerName = (managerId, managers) => {
  const manager = managers.find((m) => m.id === managerId);
  return manager ? manager.name : '-';
};

export const getManagerOptions = (managers) => managers.map((m) => ({
  value: m.id,
  label: m.name,
}));

// Map old borrower type values to new display labels
export const getBorrowerTypeLabel = (borrowerType) => {
  const typeMap = {
    'Individual': 'CRE',
    'Business': 'C&I',
    'CRE': 'CRE',
    'C&I': 'C&I',
  };
  return typeMap[borrowerType] || borrowerType || 'Unknown';
};
