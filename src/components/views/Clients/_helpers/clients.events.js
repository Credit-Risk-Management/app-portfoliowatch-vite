import { $clients, $clientsView, $clientsFilter, $clientsForm } from '@src/signals';
import borrowersApi from '@src/api/borrowers.api';

export const fetchClients = async () => {
  try {
    $clientsView.update({ isTableLoading: true });

    const { searchTerm, clientType, kycStatus, riskRating } = $clientsFilter.value;

    const filters = {
      searchTerm,
      borrowerType: clientType,
      kycStatus,
      riskRating,
    };

    const response = await borrowersApi.getAll(filters);
    
    $clients.update({
      list: response.data || [],
      totalCount: response.count || 0,
    });
  } catch (error) {
    $clients.update({ list: [], totalCount: 0 });
  } finally {
    $clientsView.update({ isTableLoading: false });
  }
};

export const handleAddClient = async () => {
  try {
    const formData = $clientsForm.value;

    const response = await borrowersApi.create(formData);

    $clientsView.update({ showAddModal: false });
    $clientsForm.reset();

    await fetchClients();
    
    return response;
  } catch (error) {
    throw error;
  }
};

export const handleEditClient = async () => {
  try {
    const formData = $clientsForm.value;

    await borrowersApi.update(formData.id, formData);

    $clientsView.update({ showEditModal: false });
    $clientsForm.reset();

    await fetchClients();
  } catch (error) {
    throw error;
  }
};

export const handleDeleteClient = async (clientId) => {
  try {
    await borrowersApi.delete(clientId);

    $clientsView.update({ showDeleteModal: false });

    await fetchClients();
  } catch (error) {
    throw error;
  }
};
