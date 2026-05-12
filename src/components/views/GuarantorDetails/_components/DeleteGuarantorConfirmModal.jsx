import { useState } from 'react';
import UniversalModal from '@src/components/global/UniversalModal';
import { $deleteGuarantorConfirmModal } from '../_helpers/deleteGuarantorConfirmModal.consts';
import * as deleteGuarantorConfirmModalEvents from '../_helpers/deleteGuarantorConfirmModal.events';
import { executeDeleteGuarantorFromModal } from '../_helpers/guarantorDetails.resolvers';

export default function DeleteGuarantorConfirmModal() {
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    show, name,
  } = $deleteGuarantorConfirmModal.value;
  const displayName = name?.trim() || 'this guarantor';

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await executeDeleteGuarantorFromModal();
    } catch {
      // Resolver shows dangerAlert
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <UniversalModal
      show={show}
      onHide={deleteGuarantorConfirmModalEvents.closeDeleteGuarantorConfirmModal}
      headerText="Delete guarantor"
      leftBtnText="Cancel"
      leftBtnOnClick={deleteGuarantorConfirmModalEvents.closeDeleteGuarantorConfirmModal}
      rightBtnText={isDeleting ? 'Deleting…' : 'Delete'}
      rightBtnOnClick={handleConfirmDelete}
      rightButtonDisabled={isDeleting}
      rightBtnClass="bg-danger border-danger text-white"

    >
      <p className="text-info-100 mb-8">
        Are you sure you want to delete guarantor
        {' '}
        <span className="fw-bold">{displayName}</span>
        ?
      </p>
      <p className="text-warning-500 mb-0">This action cannot be undone.</p>
    </UniversalModal>
  );
}
