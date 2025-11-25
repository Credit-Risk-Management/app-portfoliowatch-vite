import UniversalModal from '@src/components/global/UniversalModal';
import { $loansView, $loans } from '@src/signals';
import { handleDeleteLoan } from '../_helpers/loans.events';

const DeleteLoanModal = () => {
  const loan = $loans.value.selectedLoan;

  return (
    <UniversalModal
      show={$loansView.value.showDeleteModal}
      onHide={() => $loansView.update({ showDeleteModal: false })}
      headerText="Delete Loan"
      headerBgColor="danger"
      leftBtnText="Cancel"
      rightBtnText="Delete"
      rightBtnVariant="danger"
      rightBtnClass="text-white"
      rightBtnOnClick={() => handleDeleteLoan(loan?.id)}
    >
      {loan ? (
        <div>
          <p className="text-white">Are you sure you want to delete this loan?</p>
          <p className="fw-700">{loan.borrowerName} - Loan #{loan.loanNumber}</p>
          <p className="text-danger-200">This action cannot be undone.</p>
        </div>
      ) : null}
    </UniversalModal>
  );
};

export default DeleteLoanModal;
