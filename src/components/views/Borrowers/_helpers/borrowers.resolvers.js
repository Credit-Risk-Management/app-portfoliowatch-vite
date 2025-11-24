/* eslint-disable import/prefer-default-export */
import { $relationshipManagers, $borrowers, $borrowersView } from '@src/signals';
import relationshipManagersApi from '@src/api/relationshipManagers.api';
import borrowersApi from '@src/api/borrowers.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';

export const loadReferenceData = async () => {
  const managersResponse = await relationshipManagersApi.getAll();
  $relationshipManagers.update({ list: managersResponse.data || [] });
};

export const fetchAndSetBorrowerData = async (filters = {}) => {
  try {
    const response = await borrowersApi.getAll(filters);
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
