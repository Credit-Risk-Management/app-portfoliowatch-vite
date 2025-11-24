import UniversalModal from '@src/components/global/UniversalModal';
import { $borrowersView, $borrowers } from '@src/signals';
import { handleDeleteBorrower } from '../_helpers/borrowers.events';

const DeleteBorrowerModal = () => (
  <UniversalModal
    show={$borrowersView.value.showDeleteModal}
    onHide={() => $borrowersView.update({ showDeleteModal: false })}
    headerText="Delete Borrower"
    headerBgColor="danger"
    leftBtnText="Cancel"
    rightBtnText="Delete"
    rightBtnVariant="danger"
    rightBtnClass="text-white"
    rightBtnOnClick={() => handleDeleteBorrower($borrowers.value.selectedBorrower?.id)}
  >
    {$borrowers.value.selectedBorrower ? (
      <div>
        <p>Are you sure you want to delete this borrower?</p>
        <p className="fw-700">{$borrowers.value.selectedBorrower.name} ({$borrowers.value.selectedBorrower.Borrower_id})</p>
        <p className="text-danger">This action cannot be undone.</p>
      </div>
    ) : null}
  </UniversalModal>
);

export default DeleteBorrowerModal;
