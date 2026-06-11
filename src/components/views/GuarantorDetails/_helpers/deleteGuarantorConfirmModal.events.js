import { $borrowerDetailView } from '@src/components/views/BorrowerDetails/_helpers/borrowerDetail.consts';
import { $guarantorDetailView } from './guarantorDetails.consts';
import {
  $deleteGuarantorConfirmModal,
  deleteGuarantorDetailNavigateRef,
} from './deleteGuarantorConfirmModal.consts';

export const closeDeleteGuarantorConfirmModal = () => {
  deleteGuarantorDetailNavigateRef.current = null;
  $deleteGuarantorConfirmModal.update({
    show: false,
    context: 'borrowerTab',
    guarantorId: null,
    borrowerId: null,
    name: '',
  });
};

/**
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {{ guarantorId: string, borrowerId?: string | null, name?: string | null }} params
 */
export const openDeleteGuarantorConfirmFromDetail = (navigate, { guarantorId, borrowerId, name }) => {
  if (!guarantorId) return;
  deleteGuarantorDetailNavigateRef.current = navigate;
  $deleteGuarantorConfirmModal.update({
    show: true,
    context: 'guarantorDetail',
    guarantorId,
    borrowerId: borrowerId ?? null,
    name: (name && String(name)) || '',
  });
  $guarantorDetailView.update({
    guarantorDeleteModalNonce: ($guarantorDetailView.value.guarantorDeleteModalNonce || 0) + 1,
  });
};

/**
 * @param {{ guarantorId: string, borrowerId: string, name?: string | null }} params
 */
export const openDeleteGuarantorConfirmFromBorrowerTab = ({ guarantorId, borrowerId, name }) => {
  if (!guarantorId || !borrowerId) return;
  deleteGuarantorDetailNavigateRef.current = null;
  $deleteGuarantorConfirmModal.update({
    show: true,
    context: 'borrowerTab',
    guarantorId,
    borrowerId,
    name: (name && String(name)) || '',
  });
  $borrowerDetailView.update({
    guarantorDeleteModalNonce: ($borrowerDetailView.value.guarantorDeleteModalNonce || 0) + 1,
  });
};
