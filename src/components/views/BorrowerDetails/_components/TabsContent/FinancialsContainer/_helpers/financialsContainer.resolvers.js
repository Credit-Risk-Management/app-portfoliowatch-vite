import { getPermanentUploadLink } from '@src/api/borrowerFinancialUploadLink.api';
import { fetchFinancialHistory as fetchFinancialHistoryFromManagement } from '@src/components/views/BorrowerDetails/_helpers/borrowerDetailsManagementContainer.resolvers';
import { $financialsContainerView } from './financialsContainer.consts';

export const fetchFinancialHistory = () => fetchFinancialHistoryFromManagement();

export const fetchPermanentUploadLink = async (borrowerId) => {
  if (!borrowerId) return;
  try {
    const response = await getPermanentUploadLink(borrowerId);
    const data = response?.data ?? response;
    if (data?.token || response?.status === 'success') {
      $financialsContainerView.update({ permanentUploadLink: data ?? response?.data });
    }
  } catch (error) {
    console.error('Error fetching permanent upload link:', error);
    $financialsContainerView.update({ permanentUploadLink: null });
  }
};
