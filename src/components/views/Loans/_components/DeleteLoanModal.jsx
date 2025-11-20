import UniversalModal from '@src/components/global/UniversalModal';
import { $loansView, $loans } from '@src/signals';
import { handleDeleteLoan } from '../_helpers/loans.events';

const DeleteLoanModal = () => {
  const loan = $loans.value.selectedLoan;

  const modalBody = loan ? (
    <div>
      <p>Are you sure you want to delete this loan?</p>
      <p className="fw-700">{loan.borrower_name} - Loan #{loan.loan_number}</p>
      <p className="text-danger">This action cannot be undone.</p>
    </div>
  ) : null;

  return (
    <UniversalModal
      show={$loansView.value.showDeleteModal}
      onHide={() => $loansView.update({ showDeleteModal: false })}
      headerText="Delete Loan"
      headerBgColor="danger"
      body={modalBody}
      leftBtnText="Cancel"
      rightBtnText="Delete"
      rightBtnVariant="danger"
      rightBtnClass="text-white"
      rightBtnOnClick={() => handleDeleteLoan(loan?.id)}
    />
  );
};

export default DeleteLoanModal;

