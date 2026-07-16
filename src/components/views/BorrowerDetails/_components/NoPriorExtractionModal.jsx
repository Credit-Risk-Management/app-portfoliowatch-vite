import UniversalModal from '@src/components/global/UniversalModal';
import { $borrowerFinancialsView } from '@src/signals';
import * as events from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.events';
import {
  formatFinancialDate,
  financialHasUploadedDocuments,
} from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.helpers';

const NoPriorExtractionModal = () => {
  const pending = $borrowerFinancialsView.value.pendingRerunFinancial;
  const hasDocuments = financialHasUploadedDocuments(pending);

  return (
    <UniversalModal
      show={$borrowerFinancialsView.value.activeModalKey === 'noPriorExtraction'}
      onHide={events.closeNoPriorExtractionModal}
      headerText="No prior extraction"
      leftBtnText="Cancel"
      rightBtnText="Run extraction"
      rightBtnClass="btn-primary text-white"
      rightButtonDisabled={!hasDocuments}
      rightBtnOnClick={() => events.confirmRunExtractionFromModal(pending)}
    >
      {pending ? (
        <div>
          <p>
            No prior extraction was found for this financial record. Would you like to run extraction?
          </p>
          <p className="fw-700 mb-8">
            As of date: {formatFinancialDate(pending.asOfDate) ?? '—'}
          </p>
          {!hasDocuments ? (
            <p className="text-info-200 small mb-0">
              Upload documents to this financial record before extraction can run.
            </p>
          ) : null}
        </div>
      ) : null}
    </UniversalModal>
  );
};

export default NoPriorExtractionModal;
