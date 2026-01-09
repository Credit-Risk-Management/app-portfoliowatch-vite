import { $relationshipManagers, $relationshipManagersView, $relationshipManagersForm, $managerDetail } from '@src/signals';

export const handlePieClick = (data, navigate) => {
  if (!data || !navigate) return;

  // Recharts passes data in payload property
  const payload = data.payload || data;
  let rating = payload.rating !== undefined && payload.rating !== null
    ? payload.rating
    : null;

  // If rating is null, try to extract it from the name field (e.g., "WATCH 1" -> 1)
  if (rating === null || rating === undefined) {
    const name = payload.name || '';
    const watchMatch = name.match(/WATCH\s+(\d+)/i);
    if (watchMatch) {
      rating = parseInt(watchMatch[1], 10);
    }
  }

  // Navigate if we have a valid rating (1-5, not null/undefined)
  if (rating !== null && rating !== undefined && rating >= 1 && rating <= 5) {
    navigate(`/loans?watchScore=${rating}`);
  }
};

export const handleMetricCardClick = (path) => {
  window.location.href = path;
};

export const handleEditClick = (manager) => {
  $relationshipManagers.update({ selectedManager: manager });
  $relationshipManagersForm.update({
    id: manager.id,
    name: manager.name,
    email: manager.email,
    phone: manager.phone,
    position_title: manager.positionTitle || manager.position_title,
    office_location: manager.officeLocation || manager.office_location,
    manager_id: manager.managerId || manager.manager_id || '',
    is_active: manager.isActive !== undefined ? manager.isActive : manager.is_active,
  });
  $relationshipManagersView.update({ showEditModal: true });
};

export const handleEditSuccess = async (updatedManager) => {
  $managerDetail.value = {
    ...$managerDetail.value,
    manager: updatedManager,
  };
};
