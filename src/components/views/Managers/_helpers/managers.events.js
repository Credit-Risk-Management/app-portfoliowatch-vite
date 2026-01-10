import { $relationshipManagers, $relationshipManagersFilter, $relationshipManagersView, $relationshipManagersForm } from '@src/signals';
import relationshipManagersApi from '@src/api/relationshipManagers.api';

export const fetchManagers = async () => {
  try {
    $relationshipManagers.update({ isTableLoading: true });

    const { searchTerm, isActive } = $relationshipManagersFilter.value;

    const filters = {
      isActive: isActive !== '' ? isActive : undefined,
    };

    const managersResponse = await relationshipManagersApi.getAll(filters);
    const managers = managersResponse.data || [];

    let filteredManagers = managers;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredManagers = managers.filter((manager) => manager.name?.toLowerCase().includes(term)
        || manager.email?.toLowerCase().includes(term)
        || manager.positionTitle?.toLowerCase().includes(term)
        || manager.position_title?.toLowerCase().includes(term)
        || manager.officeLocation?.toLowerCase().includes(term)
        || manager.office_location?.toLowerCase().includes(term));
    }

    $relationshipManagers.update({
      list: filteredManagers,
      totalCount: filteredManagers.length,
      isTableLoading: false,
    });
  } catch (error) {
    console.error('Failed to fetch managers:', error);
    $relationshipManagers.update({ isTableLoading: false });
  }
};

// Fetch single manager by ID (for detail page)
export const fetchManagerById = async (managerId) => {
  try {
    const managerResponse = await relationshipManagersApi.getById(managerId);
    return managerResponse.data || managerResponse;
  } catch (error) {
    console.error('Error fetching manager:', error);
    return null;
  }
};

// Handle add manager
export const handleAddManager = async () => {
  try {
    const formData = $relationshipManagersForm.value;

    const newManager = {
      ...formData,
      manager_id: formData.manager_id || null, // Convert empty string to null
    };

    const createdManagerResponse = await relationshipManagersApi.create(newManager);
    const createdManager = createdManagerResponse.data || createdManagerResponse;

    // Update the list in the signal
    $relationshipManagers.update({
      list: [...$relationshipManagers.value.list, createdManager],
      totalCount: $relationshipManagers.value.totalCount + 1,
    });

    // Close modal and reset form
    $relationshipManagersView.update({ showAddModal: false });
    $relationshipManagersForm.reset();
  } catch (error) {
    // Error is already handled by the API client
  }
};

// Handle edit manager
export const handleEditManager = async (onSuccess) => {
  try {
    const formData = $relationshipManagersForm.value;

    const updatedManagerResponse = await relationshipManagersApi.update(formData.id, formData);
    const updatedManager = updatedManagerResponse.data || updatedManagerResponse;

    // Update the list in the signal
    const updatedList = $relationshipManagers.value.list.map((m) => (m.id === formData.id ? updatedManager : m));

    $relationshipManagers.update({
      list: updatedList,
      selectedManager: null,
    });

    // Close modal and reset form
    $relationshipManagersView.update({ showEditModal: false });
    $relationshipManagersForm.reset();

    // Call success callback if provided (for detail page refresh)
    if (onSuccess) {
      onSuccess(updatedManager);
    }
  } catch (error) {
    // Error is already handled by the API client
  }
};
