import UniversalModal from '@src/components/global/UniversalModal';
import { Spinner } from 'react-bootstrap';
import { $borrowerFinancialsView } from '@src/signals';
import * as consts from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.consts';
import * as events from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.events';
import { formatFinancialDate } from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.helpers';

const RerunCalculationsModal = () => {
  const pending = $borrowerFinancialsView.value.pendingRerunCalculationsFinancial;
  const isRerunning = consts.$financialRowActionInProgress.value.action === 'rerunCalculations'
    && consts.$financialRowActionInProgress.value.financialId === pending?.id;

  return (
    <UniversalModal
      show={$borrowerFinancialsView.value.activeModalKey === 'rerunCalculations'}
      onHide={() => {
        if (!isRerunning) events.closeRerunCalculationsModal();
      }}
      headerText="Rerun calculations"
      leftBtnText="Cancel"
      leftButtonDisabled={isRerunning}
      keyboard={!isRerunning}
      backdrop={isRerunning ? 'static' : true}
      rightBtnText={isRerunning ? (
        <>
          <Spinner animation="border" size="sm" className="me-2 align-middle" role="status" aria-hidden />
          Running…
        </>
      ) : 'Rerun calculations'}
      rightBtnClass="btn-primary text-white d-inline-flex align-items-center"
      rightButtonDisabled={isRerunning}
      rightBtnOnClick={() => events.confirmRerunCalculations()}
    >
      {pending ? (
        <div>
          <p>
            Recalculate financial metrics for this record using the latest extracted data?
          </p>
          <p className="fw-700 mb-0">
            As of date: {formatFinancialDate(pending.asOfDate) ?? '—'}
          </p>
        </div>
      ) : null}
    </UniversalModal>
  );
};

export default RerunCalculationsModal;
