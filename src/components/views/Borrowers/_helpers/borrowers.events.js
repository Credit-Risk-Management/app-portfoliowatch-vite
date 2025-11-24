import { $borrowersView, $borrowersFilter, $borrowersForm } from '@src/signals';
import borrowersApi from '@src/api/borrowers.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import * as resolvers from './borrowers.resolvers';

export const handleAddBorrower = async () => {
  try {
    const formData = $borrowersForm.value;

    await borrowersApi.create(formData);

    $borrowersView.update({ showAddModal: false });
    $borrowersForm.reset();

    await resolvers.fetchAndSetBorrowerData();
  } catch (error) {
    dangerAlert(error.message || 'Failed to add borrower');
  } finally {
    $borrowersView.update({ isTableLoading: false });
  }
};

export const handleEditBorrower = async () => {
  try {
    const formData = $borrowersForm.value;

    await borrowersApi.update(formData.id, formData);

    $borrowersView.update({ showEditModal: false });
    $borrowersForm.reset();

    await resolvers.fetchAndSetBorrowerData();
  } catch (error) {
    dangerAlert(error.message || 'Failed to edit borrower');
  } finally {
    $borrowersView.update({ isTableLoading: false });
  }
};

export const handleDeleteBorrower = async (borrowerId) => {
  try {
    await borrowersApi.delete(borrowerId);

    $borrowersView.update({ showDeleteModal: false });

    await resolvers.fetchAndSetBorrowerData();
  } catch (error) {
    dangerAlert(error.message || 'Failed to delete borrower');
  } finally {
    $borrowersView.update({ isTableLoading: false });
  }
};

export const handleBorrowerFilterChange = async () => {
  try {
    const borrowerTypeValue = Array.isArray($borrowersFilter.value.borrowerType)
      ? $borrowersFilter.value.borrowerType.filter((type) => type !== '').join(',')
      : $borrowersFilter.value.borrowerType;

    const filters = {
      searchTerm: $borrowersFilter.value.searchTerm,
      borrowerType: borrowerTypeValue,
      kycStatus: $borrowersFilter.value.kycStatus,
      riskRating: $borrowersFilter.value.riskRating,
    };
    await resolvers.fetchAndSetBorrowerData(filters);
  } catch (error) {
    dangerAlert(error.message || 'Failed to filter borrowers');
  } finally {
    $borrowersView.update({ isTableLoading: false });
  }
};
