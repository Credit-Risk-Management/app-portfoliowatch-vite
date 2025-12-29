import { $relationshipManagers, $borrowers, $borrowersView, $borrowersFilter } from '@src/signals';
import relationshipManagersApi from '@src/api/relationshipManagers.api';
import borrowersApi from '@src/api/borrowers.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';

export const loadReferenceData = async () => {
  const managersResponse = await relationshipManagersApi.getAll();
  $relationshipManagers.update({ list: managersResponse.data || [] });
};

export const fetchAndSetBorrowerData = async (filters = {}, isShowLoader = true) => {
  if (isShowLoader) {
    $borrowersView.update({ isTableLoading: true });
  }
  try {
    const paginationAndSortParams = {
      page: $borrowersFilter.value?.page || 1,
      limit: 10,
    };
    
    // Only include sort params if they are defined
    if ($borrowersFilter.value?.sortKey) {
      paginationAndSortParams.sortKey = $borrowersFilter.value.sortKey;
    }
    if ($borrowersFilter.value?.sortDirection) {
      paginationAndSortParams.sortDirection = $borrowersFilter.value.sortDirection;
    }
    const response = await borrowersApi.getAll({ ...filters, ...paginationAndSortParams });
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
