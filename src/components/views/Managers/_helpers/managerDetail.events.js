import { $relationshipManagers, $relationshipManagersView, $relationshipManagersForm, $managerDetail } from '@src/signals';

export const handlePieClick = (data, navigate) => {
  if (data && data.rating) {
    navigate(`/loans?watchScore=${data.rating}`);
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
    position_title: manager.position_title,
    office_location: manager.office_location,
    manager_id: manager.manager_id || '',
    is_active: manager.is_active,
  });
  $relationshipManagersView.update({ showEditModal: true });
};

export const handleEditSuccess = async (updatedManager) => {
  $managerDetail.value = {
    ...$managerDetail.value,
    manager: updatedManager,
  };
};
