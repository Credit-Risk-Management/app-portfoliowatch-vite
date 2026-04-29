import UniversalModal from '@src/components/global/UniversalModal';
import { Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { $borrowerFinancialsView } from '@src/signals';
import * as events from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.events';
import * as resolvers from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.resolvers';

const DeleteBorrowerFinancialModal = () => {
  const { borrowerId } = useParams();
  const pending = $borrowerFinancialsView.value.pendingDeleteFinancial;
  const isDeleting = $borrowerFinancialsView.value.isDeletingBorrowerFinancial;

  return (
    <UniversalModal
      show={$borrowerFinancialsView.value.activeModalKey === 'deleteFinancials'}
      onHide={() => {
        if (!isDeleting) events.closeDeleteFinancialModal();
      }}
      headerText="Delete financial record"
      leftBtnText="Cancel"
      leftButtonDisabled={isDeleting}
      keyboard={!isDeleting}
      backdrop={isDeleting ? 'static' : true}
      rightBtnText={isDeleting ? (
        <>
          <Spinner animation="border" size="sm" className="me-2 align-middle" role="status" aria-hidden />
          Deleting…
        </>
      ) : 'Delete'}
      rightBtnClass="btn-danger text-white d-inline-flex align-items-center"
      rightButtonDisabled={isDeleting}
      rightBtnOnClick={() => resolvers.confirmDeleteBorrowerFinancial(borrowerId)}
    >
      {pending ? (
        <div>
          <p>Delete this financial submission and all files stored for it?</p>
          <p className="fw-700 mb-8">
            As of date: {pending.asOfDate ?? '—'}
          </p>
          <p className="text-danger small mb-0">This cannot be undone. Files in cloud storage will be removed.</p>
        </div>
      ) : null}
    </UniversalModal>
  );
};

export default DeleteBorrowerFinancialModal;
