import { $borrowersView, $borrowersFilter, $borrowersForm } from '@src/signals';
import borrowersApi from '@src/api/borrowers.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { resolvePageLimit } from '@src/consts/consts';
import { borrowersFilterToUrlParams } from '@src/utils/tableFilterUrlParams';
import * as resolvers from './borrowers.resolvers';

/** Toggle one compliance checklist row (mutually exclusive within each group). */
export const toggleBorrowersComplianceFilter = (setSearchParams, filterKey, value) => {
  const current = $borrowersFilter.value?.[filterKey];
  const nextValue = current === value ? '' : value;
  syncBorrowersListUrl(setSearchParams, { [filterKey]: nextValue, page: 1 });
};

export const clearBorrowersComplianceFilters = (setSearchParams) => {
  syncBorrowersListUrl(setSearchParams, {
    quarterlyPackageComplete: '',
    impactQuestionnaireComplete: '',
    taxReturn2025Complete: '',
    page: 1,
  });
};

/** Sync $borrowersFilter to the URL after signal-driven filter edits (search, selects). */
export const syncBorrowersListUrl = (setSearchParams, patch = {}) => {
  if (patch && Object.keys(patch).length > 0) {
    $borrowersFilter.update(patch);
  }
  setSearchParams(borrowersFilterToUrlParams($borrowersFilter.value), { replace: true });
};

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

    await borrowersApi.update(formData.id, {
      name: formData.name,
      primaryContact: formData.primaryContact,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      streetAddress: formData.streetAddress,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      borrowerType: formData.borrowerType,
      relationshipManagerId: formData.relationshipManagerId || null,
      notes: formData.notes ?? '',
    });

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

    const relationshipManagerValue = Array.isArray($borrowersFilter.value.relationshipManager)
      ? $borrowersFilter.value.relationshipManager.filter((manager) => manager !== '').join(',')
      : $borrowersFilter.value.relationshipManager;

    const filters = {
      searchTerm: $borrowersFilter.value.searchTerm,
      borrowerType: borrowerTypeValue,
      relationshipManager: relationshipManagerValue,
      quarterlyPackageComplete: $borrowersFilter.value.quarterlyPackageComplete,
      impactQuestionnaireComplete: $borrowersFilter.value.impactQuestionnaireComplete,
      taxReturn2025Complete: $borrowersFilter.value.taxReturn2025Complete,
      limit: resolvePageLimit($borrowersFilter.value.limit),
    };

    await resolvers.fetchAndSetBorrowerData(filters);
  } catch (error) {
    dangerAlert(error.message || 'Failed to filter borrowers');
  } finally {
    $borrowersView.update({ isTableLoading: false });
  }
};
