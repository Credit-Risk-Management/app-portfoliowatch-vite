import { Alert, ButtonGroup, Button, Row, Col, Form } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import { $borrowerFinancialsView, $borrowerFinancialsForm } from '@src/signals';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import DocumentsTab from './DocumentsTab';
import TriggersTab from './TriggersTab';
import DebtServiceTab from './DebtServiceTab';
import WatchScoreResultsModal from './WatchScoreResultsModal';
import {
  handleClose as handleCloseHelper,
  setActiveTab as setActiveTabHelper,
  handleFileUpload as handleFileUploadHelper,
  handleSubmit as handleSubmitHelper,
  handleRemoveDocument as handleRemoveDocumentHelper,
  handleSwitchDocument as handleSwitchDocumentHelper,
  handleOpenEditMode as handleOpenEditModeHelper,
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

  // Load financial data when opening in edit mode
  useEffectAsync(async () => {
    const { showSubmitModal, isEditMode, editingFinancialId } = $borrowerFinancialsView.value;
    if (showSubmitModal && isEditMode && editingFinancialId) {
      try {
        const response = await borrowerFinancialsApi.getById(editingFinancialId);
        if (response.success && response.data) {
          await handleOpenEditModeHelper(response.data, $modalState);
        }
      } catch (err) {
        console.error('Error loading financial data for editing:', err);
        $modalState.update({ error: 'Failed to load financial data for editing' });
      }
    }
  }, [$borrowerFinancialsView.value.showSubmitModal, $borrowerFinancialsView.value.isEditMode, $borrowerFinancialsView.value.editingFinancialId]);

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
    <>
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
          <Row className="align-items-end my-12 my-md-16">
            <Col xs={12} md={3} className="mb-12 mb-md-0">
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
            <Col xs={12} md={2} className="mb-12 mb-md-0">
              <Form.Label className="text-info-100">Accountability Score</Form.Label>
              <SelectInput
                value={$borrowerFinancialsForm.value.accountabilityScore}
                name="accountabilityScore"
                signal={$borrowerFinancialsForm}
                options={[
                  { value: '', label: 'Select Accountability Score' },
                  { value: '1', label: '1 - Excellent' },
                  { value: '2', label: '2 - Good' },
                  { value: '3', label: '3 - Satisfactory' },
                  { value: '4', label: '4 - Marginal' },
                  { value: '5', label: '5 - Poor' },
                  { value: '6', label: '6 - Poor' },
                ]}
                placeholder="Select Accountability Score"
              />
            </Col>
            <Col xs={12} md={7} className="d-flex justify-content-end">
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

      {/* Watch Score Results Modal */}
      <WatchScoreResultsModal />
    </>
  );
};

export default SubmitFinancialsModal;
