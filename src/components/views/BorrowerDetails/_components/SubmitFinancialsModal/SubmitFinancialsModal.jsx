/* eslint-disable no-nested-ternary */
/* eslint-disable no-return-await */
import { useEffect } from 'react';
import { Alert, ButtonGroup, Button, Row, Col, Form } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import { $borrowerFinancialsView, $borrowerFinancialsForm } from '@src/signals';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import Loadable from '@src/components/global/Loadable';
import BorrowerTriggersTab from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerTriggersTab';
import BorrowerDebtServiceTab from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerDebtServiceTab';
import WatchScoreResultsModal from '@src/components/views/Borrowers/_components/WatchScoreResultsModal';
import DocumentsContainer from '@src/components/views/BorrowerDetails/_components/DocumentsContainer';
import * as events from './_helpers/submitFinancialsModal.events';
import * as resolvers from './_helpers/submitFinancialsModal.resolvers';
import { $financialDocsUploader, $modalState } from './_helpers/submitFinancialsModal.consts';

const SubmitFinancialsModal = () => {
  const { activeTab } = $borrowerFinancialsForm.value;
  const { isEditMode, activeModalKey, editingFinancialId } = $borrowerFinancialsView.value;
  const {
    ocrApplied,
    isSubmitting,
    error,
    refreshKey,
    pdfUrl,
    previousFinancial,
    isLoadingPrevious,
  } = $modalState.value;

  useEffect(() => {
    if (activeModalKey === 'submitFinancials' && isEditMode && editingFinancialId) {
      const loadData = async () => {
        try {
          const response = await borrowerFinancialsApi.getById(editingFinancialId);
          if (response?.success && response?.data) {
            await resolvers.handleOpenEditMode(response.data);
          }
        } catch (err) {
          $modalState.update({ error: 'Failed to load financial data for editing' });
        }
      };
      loadData();
    }
  }, [activeModalKey, isEditMode, editingFinancialId]);

  useEffectAsync(async () => {
    if (activeTab === 'triggers' && $borrowerFinancialsView.value.currentBorrowerId && !previousFinancial) {
      $modalState.update({ isLoadingPrevious: true });
      try {
        const response = await borrowerFinancialsApi.getByBorrowerId(
          $borrowerFinancialsView.value.currentBorrowerId,
          { limit: 2, sortKey: 'asOfDate', sortDirection: 'desc' },
        );
        const data = response?.data ?? (Array.isArray(response) ? response : []);
        if (data?.length > 0) {
          $modalState.update({ previousFinancial: data[0] });
        }
      } catch (err) {
        // no-op
      } finally {
        $modalState.update({ isLoadingPrevious: false });
      }
    }
  }, [activeTab, previousFinancial]);

  const activeTabClass = 'bg-info-100 text-info-900';
  const inactiveTabClass = 'text-info-100';
  const modalTitle = isEditMode ? 'Edit Financial Data' : 'Submit Financial Data';
  const submitButtonText = isSubmitting ? (isEditMode ? 'Updating...' : 'Submitting...') : 'Update';

  const handleCloseWithRevoke = () => events.handleClose(pdfUrl);
  const handleSubmitClick = () => resolvers.handleSubmit(handleCloseWithRevoke);
  const handleFileUploadClick = async () => resolvers.handleFileUpload(ocrApplied, pdfUrl);

  return (
    <>
      <UniversalModal
        show={activeModalKey === 'submitFinancials'}
        onHide={handleCloseWithRevoke}
        headerText={modalTitle}
        leftBtnText="Cancel"
        rightBtnText={submitButtonText}
        rightBtnOnClick={handleSubmitClick}
        rightButtonDisabled={isSubmitting}
        size="fullscreen"
        closeButton
      >
        <Loadable signal={$modalState} template="fullscreen" className="pt-16">
          {error && (
            <Alert variant="danger" dismissible onClose={() => $modalState.update({ error: null })}>
              {error}
            </Alert>
          )}

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
                ]}
                placeholder="Select Accountability Score"
              />
            </Col>
            <Col xs={12} md={7} className="d-flex justify-content-end">
              <ButtonGroup>
                <Button
                  variant={activeTab === 'documents' ? 'info' : 'outline-info'}
                  className={activeTab === 'documents' ? activeTabClass : inactiveTabClass}
                  onClick={() => events.setActiveTab('documents')}
                >
                  Documents
                </Button>
                <Button
                  variant={activeTab === 'triggers' ? 'info' : 'outline-info'}
                  className={activeTab === 'triggers' ? activeTabClass : inactiveTabClass}
                  onClick={() => events.setActiveTab('triggers')}
                >
                  Triggers
                </Button>
                <Button
                  variant={activeTab === 'debtService' ? 'info' : 'outline-info'}
                  className={activeTab === 'debtService' ? activeTabClass : inactiveTabClass}
                  onClick={() => events.setActiveTab('debtService')}
                >
                  Debt Service
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          <div className="px-32 border-top border-info-100 pt-8">
            {activeTab === 'documents' && (
              <DocumentsContainer
                pdfUrl={pdfUrl}
                ocrApplied={ocrApplied}
                handleFileUpload={handleFileUploadClick}
                refreshKey={refreshKey}
                $financialDocsUploader={$financialDocsUploader}
                $modalState={$modalState}
                handleRemoveDocument={(_$modalState, documentId) => resolvers.handleRemoveDocument(documentId)}
                handleSwitchDocument={(_$modalState, index) => resolvers.handleSwitchDocument(index)}
              />
            )}
            {activeTab === 'triggers' && (
              <BorrowerTriggersTab
                currentForm={$borrowerFinancialsForm.value}
                previousFinancial={previousFinancial}
                isLoadingPrevious={isLoadingPrevious}
              />
            )}
            {activeTab === 'debtService' && <BorrowerDebtServiceTab />}
          </div>
        </Loadable>
      </UniversalModal>
      <WatchScoreResultsModal $modalState={$modalState} />
    </>
  );
};

export default SubmitFinancialsModal;
