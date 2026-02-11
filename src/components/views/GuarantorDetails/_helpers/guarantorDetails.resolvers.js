/* eslint-disable import/prefer-default-export */
import guarantorsApi from '@src/api/guarantors.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $guarantorDetailView, $guarantorDetailsData } from './guarantorDetails.consts';

/**
 * Fetch invitation data by token
 * @param {string} token - The invitation token from URL params
 */
export const fetchGuarantorDetail = async (guarantorId) => {
  $guarantorDetailView.update({
    isLoading: true,
  });
  try {
    const response = await guarantorsApi.getById(guarantorId);
    const guarantorData = response.data;
    $guarantorDetailsData.update({
      name: guarantorData.name,
      email: guarantorData.email,
      phone: guarantorData.phone,
      financials: guarantorData.financials,
      loans: guarantorData.guarantorToLoans.map((loan) => loan.loan),
    });
    $guarantorDetailView.update({
      guarantorId: guarantorData.id,
    });
  } catch (err) {
    console.error('Failed to fetch guarantor detail:', err);
    $guarantorDetailView.update({
      guarantor: null,
      isLoading: false,
    });
    dangerAlert(`Failed to fetch guarantor detail: ${err.message}`);
  } finally {
    $guarantorDetailView.update({
      isLoading: false,
    });
  }
};
