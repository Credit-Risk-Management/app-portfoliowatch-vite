import { Alert, ButtonGroup, Button, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import { $borrowerFinancialsView, $borrowerFinancialsForm } from '@src/signals';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import DocumentsTab from './DocumentsTab';
import TriggersTab from './TriggersTab';
import DebtServiceTab from './DebtServiceTab';
import {
  handleClose as handleCloseHelper,
  setActiveTab as setActiveTabHelper,
  handleFileUpload as handleFileUploadHelper,
  handleSubmit as handleSubmitHelper,
  handleRemoveDocument as handleRemoveDocumentHelper,
  handleSwitchDocument as handleSwitchDocumentHelper,
} from './submitFinancialsModal.handlers';
import { $financialDocsUploader, $modalState } from './submitFinancialsModal.signals';

const SubmitFinancialsModal = () => {
  const { activeTab } = $borrowerFinancialsForm.value;
  const { isEditMode } = $borrowerFinancialsView.value;
  const {
    ocrApplied,
    isSubmitting,
    error,
    refreshKey,
    pdfUrl,
    previousFinancial,
    isLoadingPrevious,
  } = $modalState.value;

  // Fetch previous quarter financial data when Triggers tab is activated
  useEffectAsync(async () => {
    if (activeTab === 'triggers' && $borrowerFinancialsView.value.currentBorrowerId && !previousFinancial) {
      $modalState.update({ isLoadingPrevious: true });
      try {
        const response = await borrowerFinancialsApi.getByBorrowerId(
          $borrowerFinancialsView.value.currentBorrowerId,
          { limit: 2, sortKey: 'asOfDate', sortDirection: 'desc' },
        );
        if (response.success && response.data && response.data.length > 0) {
          $modalState.update({ previousFinancial: response.data[0] });
        }
      } catch (err) {
        console.error('Error fetching previous financial data:', err);
      } finally {
        $modalState.update({ isLoadingPrevious: false });
      }
    }
  }, [activeTab, previousFinancial]);

  const activeTabClass = 'bg-info-100 text-info-900';
  const inactiveTabClass = 'text-info-100';

  // Determine modal title and button text based on mode
  const modalTitle = isEditMode ? 'Edit Financial Data' : 'Submit Financial Data';
  let submitButtonText = 'Submit';
  if (isSubmitting) {
    submitButtonText = isEditMode ? 'Updating...' : 'Submitting...';
  } else {
    submitButtonText = isEditMode ? 'Update' : 'Submit';
  }

  return (
    <UniversalModal
      show={$borrowerFinancialsView.value.showSubmitModal}
      onHide={() => handleCloseHelper($financialDocsUploader, $modalState, pdfUrl)}
      headerText={modalTitle}
      leftBtnText="Cancel"
      rightBtnText={submitButtonText}
      rightBtnOnClick={() => handleSubmitHelper($modalState, () => handleCloseHelper($financialDocsUploader, $modalState, pdfUrl))}
      rightButtonDisabled={isSubmitting}
      size="fullscreen"
      closeButton
    >
      <div className="pt-16">
        {error && (
          <Alert variant="danger" dismissible onClose={() => $modalState.update({ error: null })}>
            {error}
          </Alert>
        )}

        {/* As Of Date and Tab Navigation */}
        <Row className="align-items-end my-16">
          <Col md={4}>
            <UniversalInput
              label="As Of Date (Financial Statement Date)"
              labelClassName="text-info-100"
              type="date"
              placeholder="YYYY-MM-DD"
              value={$borrowerFinancialsForm.value.asOfDate}
              name="asOfDate"
              signal={$borrowerFinancialsForm}
              required
            />
          </Col>
          <Col md={8} className="d-flex justify-content-end">
            <ButtonGroup>
              <Button
                variant={activeTab === 'documents' ? 'info' : 'outline-info'}
                className={activeTab === 'documents' ? activeTabClass : inactiveTabClass}
                onClick={() => setActiveTabHelper('documents')}
              >
                Documents
              </Button>
              <Button
                variant={activeTab === 'triggers' ? 'info' : 'outline-info'}
                className={activeTab === 'triggers' ? activeTabClass : inactiveTabClass}
                onClick={() => setActiveTabHelper('triggers')}
              >
                Triggers
              </Button>
              <Button
                variant={activeTab === 'debtService' ? 'info' : 'outline-info'}
                className={activeTab === 'debtService' ? activeTabClass : inactiveTabClass}
                onClick={() => setActiveTabHelper('debtService')}
              >
                Debt Service
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
        <div className="px-32 border-top border-info-100 pt-8">
          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <DocumentsTab
              pdfUrl={pdfUrl}
              ocrApplied={ocrApplied}
              handleFileUpload={() => handleFileUploadHelper($financialDocsUploader, $modalState, ocrApplied, pdfUrl)}
              refreshKey={refreshKey}
              $financialDocsUploader={$financialDocsUploader}
              $modalState={$modalState}
              handleRemoveDocument={handleRemoveDocumentHelper}
              handleSwitchDocument={handleSwitchDocumentHelper}
            />
          )}

          {/* Triggers Tab */}
          {activeTab === 'triggers' && (
            <TriggersTab
              previousFinancial={previousFinancial}
              isLoadingPrevious={isLoadingPrevious}
            />
          )}

          {/* Debt Service Tab */}
          {activeTab === 'debtService' && <DebtServiceTab />}
        </div>
      </div>
    </UniversalModal>
  );
};

export default SubmitFinancialsModal;
