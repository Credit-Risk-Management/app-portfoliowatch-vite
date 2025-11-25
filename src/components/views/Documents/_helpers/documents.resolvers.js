/* eslint-disable import/prefer-default-export */
import { $loans, $documents, $documentsView, $documentsFilter } from '@src/signals';
import loansApi from '@src/api/loans.api';
import documentsApi from '@src/api/documents.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';

export const loadReferenceData = async () => {
  try {
    const loansResponse = await loansApi.getAll();
    $loans.update({ list: loansResponse.data || [] });
  } catch (error) {
    dangerAlert(error.message || 'Failed to load reference data');
  }
};

export const fetchAndSetDocumentData = async (filters = {}, isShowLoader = true) => {
  if (isShowLoader) {
    $documentsView.update({ isTableLoading: true });
  }
  try {
    const paginationAndSortParams = {
      page: $documentsFilter.value?.page || 1,
      limit: 10,
      sortKey: $documentsFilter.value?.sortKey,
      sortDirection: $documentsFilter.value?.sortDirection,
    };
    const response = await documentsApi.getAll({ ...filters, ...paginationAndSortParams });
    $documents.update({
      list: response.data || [],
      totalCount: response.count || 0,
    });
  } catch (error) {
    dangerAlert(error.message || 'Failed to fetch documents');
  } finally {
    $documentsView.update({ isTableLoading: false });
  }
};

