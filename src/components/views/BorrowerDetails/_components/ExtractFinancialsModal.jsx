import { Form, ListGroup, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import UniversalModal from '@src/components/global/UniversalModal';
import { $borrowerFinancialsView } from '@src/signals';
import * as consts from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.consts';
import * as events from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.events';
import {
  formatFinancialDate,
  getFinancialDocumentLabel,
  financialHasUploadedDocuments,
  getUploadedFinancialDocuments,
} from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.helpers';
import './ExtractFinancialsModal.scss';

const ExtractFinancialsModal = () => {
  const { borrowerId } = useParams();
  const pending = $borrowerFinancialsView.value.pendingExtractFinancial;
  const documents = getUploadedFinancialDocuments(pending);
  const selectedDocumentIds = consts.$extractSelectedDocumentIds.value || [];
  const hasDocuments = financialHasUploadedDocuments(pending);
  const hasSelection = selectedDocumentIds.length > 0;
  const isExtracting = consts.$financialRowActionInProgress.value.action === 'extract'
    && consts.$financialRowActionInProgress.value.financialId === pending?.id;

  return (
    <UniversalModal
      show={$borrowerFinancialsView.value.activeModalKey === 'extractFinancials'}
      onHide={() => {
        if (!isExtracting) events.closeExtractFinancialsModal();
      }}
      headerText="Run extraction"
      leftBtnText="Cancel"
      leftButtonDisabled={isExtracting}
      keyboard={!isExtracting}
      backdrop={isExtracting ? 'static' : true}
      rightBtnText={isExtracting ? (
        <>
          <Spinner animation="border" size="sm" className="me-2 align-middle" role="status" aria-hidden />
          Queuing…
        </>
      ) : 'Run extraction'}
      rightBtnClass="btn-primary text-white d-inline-flex align-items-center"
      rightButtonDisabled={isExtracting || !hasDocuments || !hasSelection}
      rightBtnOnClick={() => events.confirmExtractFinancials(borrowerId)}
    >
      {pending ? (
        <div className="extract-financials-modal">
          <p className="mb-8">
            As of date:
            {' '}
            <span className="fw-700">{formatFinancialDate(pending.asOfDate) ?? '—'}</span>
          </p>
          {hasDocuments ? (
            <>
              <p className="mb-8">Select the documents to send to Sensible for extraction:</p>
              <ListGroup variant="flush" className="extract-financials-modal__doc-list border rounded">
                {documents.map((doc) => {
                  const isSelected = selectedDocumentIds.includes(doc.id);
                  return (
                    <ListGroup.Item
                      key={doc.id}
                      action
                      className={`extract-financials-modal__doc-row py-8 px-12 ${
                        isExtracting ? 'extract-financials-modal__doc-row--disabled' : ''
                      }`}
                      onClick={() => {
                        if (!isExtracting) events.toggleExtractDocumentSelection(doc.id);
                      }}
                      aria-pressed={isSelected}
                    >
                      <Form.Check
                        id={`extract-doc-${doc.id}`}
                        type="checkbox"
                        className="extract-financials-modal__doc-check"
                        label={(
                          <>
                            <span className="extract-financials-modal__doc-type fw-500">
                              {getFinancialDocumentLabel(doc.documentType)}
                            </span>
                            {doc.fileName ? (
                              <span className="extract-financials-modal__doc-name ms-8 small">
                                {doc.fileName}
                              </span>
                            ) : null}
                          </>
                        )}
                        checked={isSelected}
                        readOnly
                        tabIndex={-1}
                        aria-hidden
                      />
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
              {!hasSelection ? (
                <p className="text-info-200 small mb-0 mt-8">
                  Select at least one document to continue.
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-info-200 mb-0">
              No uploaded documents are available for this financial record. Upload documents before running extraction.
            </p>
          )}
        </div>
      ) : null}
    </UniversalModal>
  );
};

export default ExtractFinancialsModal;
