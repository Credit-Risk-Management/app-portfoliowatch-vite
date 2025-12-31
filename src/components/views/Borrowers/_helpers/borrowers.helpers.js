export const getManagerName = (managerId, managers) => {
  const manager = managers.find((m) => m.id === managerId);
  return manager ? manager.name : '-';
};

export const getManagerOptions = (managers) => managers.map((m) => ({
  value: m.id,
  label: m.name,
}));
