import { $relationshipManagers, $borrowers, $borrowersView, $borrowersFilter } from '@src/signals';
import relationshipManagersApi from '@src/api/relationshipManagers.api';
import borrowersApi from '@src/api/borrowers.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';

/** Reset list filters when opening Borrowers with a clean URL (avoids stale search/facets after nav or back). */
export const resetBorrowersListFilters = () => {
  $borrowersFilter.reset();
  try {
    window.localStorage.removeItem('filterQueryString');
  } catch {
    /* ignore */
  }
};

export const loadReferenceData = async () => {
  try {
    const managersResponse = await relationshipManagersApi.getAll();

    // The API client interceptor returns response.data, so managersResponse is already { success, data, count }
    // Extract the actual managers array
    let managers = managersResponse?.data || managersResponse || [];

    // WORKAROUND: If API returned borrowers instead of managers, extract managers from borrowers
    // This handles a backend issue where /relationship-managers endpoint returns borrowers
    if (Array.isArray(managers) && managers.length > 0 && managers[0]?.borrowerId) {
      // Extract unique relationship managers from borrowers' relationshipManager field
      const managerMap = new Map();
      managers.forEach((borrower) => {
        if (borrower?.relationshipManager && borrower.relationshipManager.id) {
          const manager = borrower.relationshipManager;
          // Only add if it's a real manager (has email, no borrowerId)
          if (manager.email && !manager.borrowerId) {
            managerMap.set(manager.id, manager);
          }
        }
      });

      managers = Array.from(managerMap.values());
    }

    $relationshipManagers.update({ list: managers });
  } catch (error) {
    console.error('Error loading relationship managers:', error);
    dangerAlert('Failed to load relationship managers');
  }
};

const facetParamsFromBorrowersFilter = () => {
  const bf = $borrowersFilter.value;
  const borrowerType = Array.isArray(bf?.borrowerType)
    ? bf.borrowerType.filter((type) => type !== '').join(',')
    : bf?.borrowerType;
  const relationshipManager = Array.isArray(bf?.relationshipManager)
    ? bf.relationshipManager.filter((manager) => manager !== '').join(',')
    : bf?.relationshipManager;
  return {
    searchTerm: bf?.searchTerm,
    borrowerType,
    relationshipManager,
  };
};

export const fetchAndSetBorrowerData = async (filters = {}) => {
  $borrowersView.update({ isTableLoading: true });
  try {
    const paginationAndSortParams = {
      page: $borrowersFilter.value?.page || 1,
      limit: 10,
      sortKey: $borrowersFilter.value?.sortKey || 'name',
      sortDirection: $borrowersFilter.value?.sortDirection || 'asc',
    };

    const response = await borrowersApi.getAll({
      ...facetParamsFromBorrowersFilter(),
      ...filters,
      ...paginationAndSortParams,
    });
    $borrowers.update({
      list: response.data || [],
      totalCount: response.count || 0,
    });
  } catch (error) {
    dangerAlert(error.message || 'Failed to fetch borrowers');
  } finally {
    $borrowersView.update({ isTableLoading: false });
  }
};
