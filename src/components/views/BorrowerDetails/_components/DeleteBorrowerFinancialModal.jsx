import UniversalModal from '@src/components/global/UniversalModal';
import { useParams } from 'react-router-dom';
import { $borrowerFinancialsView } from '@src/signals';
import * as events from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.events';
import * as resolvers from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.resolvers';

const DeleteBorrowerFinancialModal = () => {
  const { borrowerId } = useParams();
  const pending = $borrowerFinancialsView.value.pendingDeleteFinancial;

  return (
    <UniversalModal
      show={$borrowerFinancialsView.value.activeModalKey === 'deleteFinancials'}
      onHide={() => events.closeDeleteFinancialModal()}
      headerText="Delete financial record"
      headerBgColor="danger"
      leftBtnText="Cancel"
      rightBtnText="Delete"
      rightBtnVariant="danger"
      rightBtnClass="text-white"
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
