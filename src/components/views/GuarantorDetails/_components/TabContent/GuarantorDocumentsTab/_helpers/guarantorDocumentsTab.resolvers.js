/* eslint-disable import/prefer-default-export */
import guarantorFinancialDocumentsApi from '@src/api/guarantorFinancialDocuments.api';
import { $guarantorDetailView } from '@src/components/views/GuarantorDetails/_helpers/guarantorDetail.consts';
import { $guarantorDocumentsView, $guarantorDocumentsDetails } from './guarantorDocumentsTab.consts';

export const fetchGuarantorDocuments = async () => {
  const guarantorId = $guarantorDetailView.value?.guarantorId;
  if (!guarantorId) return;

  try {
    $guarantorDocumentsView.update({ isTableLoading: true });
    const response = await guarantorFinancialDocumentsApi.getByGuarantor(guarantorId);
    $guarantorDocumentsDetails.update({
      list: response.data || [],
      totalCount: response.count || 0,
    });
  } catch (error) {
    console.error('Failed to fetch guarantor documents:', error);
  } finally {
    $guarantorDocumentsView.update({ isTableLoading: false });
  }
};
