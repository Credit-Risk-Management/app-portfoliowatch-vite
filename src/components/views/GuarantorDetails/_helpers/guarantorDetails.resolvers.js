import guarantorsApi from '@src/api/guarantors.api';
import { dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { $guarantorDetailView, $guarantorDetailsData } from './guarantorDetails.consts';
import {
  $submitPFSModalView,
  $submitPFSModalDetails,
  $financialDocsUploader,
} from '../_components/SubmitPFSModal/_helpers/submitPFSModal.const';
import { $documentsContainerView } from '../_components/PFSDocumentsContainer/_helpers/pfsDocuments.consts';
import {
  $guarantorDocumentsView,
  $guarantorDocumentsDetails,
  $guarantorDocumentsFilter,
} from '../_components/GuarantorDocuments/_helpers/guarantorDocuments.consts';
import {
  $copiedLink,
  $isExportingExcel,
  $permanentUploadLink,
} from '../_components/GuarantorFinancials/_helpers/guarantorFinancials.consts';
import { $guarantorsLoansView } from '../_components/GuarantorLoans/_helpers/guarantorLoans.consts';

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

/**
 * Clears guarantor detail–scoped signals when leaving `/guarantors/:guarantorId` or switching guarantors.
 */
export const resetGuarantorRouteState = () => {
  $guarantorDetailView.reset();
  $guarantorDetailView.update({ isLoading: true });
  $guarantorDetailsData.reset();
  $submitPFSModalView.reset();
  $submitPFSModalDetails.reset();
  $financialDocsUploader.reset();
  $documentsContainerView.reset();
  $guarantorDocumentsView.reset();
  $guarantorDocumentsDetails.reset();
  $guarantorDocumentsFilter.reset();
  $copiedLink.reset();
  $isExportingExcel.reset();
  $permanentUploadLink.reset();
  $guarantorsLoansView.reset();
};
