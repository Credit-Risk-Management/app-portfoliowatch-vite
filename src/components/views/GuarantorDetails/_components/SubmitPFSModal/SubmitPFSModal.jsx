/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-return-await */
import { Row, Col, Alert } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import Loadable from '@src/components/global/Loadable';
import guarantorsApi from '@src/api/guarantors.api';
import { useEffect } from 'react';
import { $submitPFSModalView, $submitPFSModalDetails, $financialDocsUploader } from './_helpers/submitPFSModal.const';
import DocumentsContainer from '../PFSDocumentsContainer/PFSDocumentsContainer';
import * as events from './_helpers/submitPFSModal.events';
import * as resolvers from './_helpers/submitPFSModal.resolvers';

const SubmitPFSModal = () => {
  // Read loading state so this component subscribes and re-renders when resolvers set isLoading
  const { isEditMode, isSubmitting, activeModalKey } = $submitPFSModalView.value;

  // Determine modal title and button text based on mode
  const modalTitle = isEditMode ? 'Edit Financial Data' : 'Submit Financial Data';

  let submitButtonText = 'Submit';
  if (isSubmitting) {
    submitButtonText = isEditMode ? 'Updating...' : 'Submitting...';
  } else {
    submitButtonText = isEditMode ? 'Update' : 'Submit';
  }

  useEffect(() => {
    if ($submitPFSModalView.value.editingFinancialId) {
      const loadData = async () => {
        try {
          const response = await guarantorsApi.getFinancialById($submitPFSModalView.value.editingFinancialId);
          if (response?.success && response?.data) {
            await resolvers.handleOpenEditMode(response.data);
          }
        } catch (err) {
          $submitPFSModalView.update({ error: 'Failed to load financial data for editing' });
        }
      };
      loadData();
    }
  }, [$submitPFSModalView.value.editingFinancialId]);
  const handleCloseWithRevoke = async () => await events.handleClose($submitPFSModalDetails.value.pdfUrl);
  const handleSubmitClick = () => resolvers.handleSubmit(handleCloseWithRevoke);
  const handleFileUploadClick = async () => resolvers.handleFileUpload($financialDocsUploader, $submitPFSModalView, $submitPFSModalView.value.ocrApplied, $submitPFSModalDetails.value.pdfUrl);

  return (
    <UniversalModal
      show={activeModalKey === 'submitPFS'}
      onHide={events.handleClose}
      headerText={modalTitle}
      leftBtnText="Cancel"
      rightBtnText={submitButtonText}
      rightBtnOnClick={handleSubmitClick}
      rightButtonDisabled={$submitPFSModalView.value.isSubmitting || $submitPFSModalView.value.isLoadingInputData}
      size="fullscreen"
      closeButton
    >
      <Loadable signal={$submitPFSModalView} template="fullscreen" className="pt-16">
        {/* As Of Date and Tab Navigation */}
        <Row className="align-items-end my-16 mt-32">
          <Col xs={12} md={3} className="mb-12 mb-md-0">
            <UniversalInput
              label="As Of Date (Financial Statement Date)"
              labelClassName="text-info-100"
              type="date"
              placeholder="YYYY-MM-DD"
              value={$submitPFSModalDetails.value.asOfDate}
              name="asOfDate"
              signal={$submitPFSModalDetails}
              required
            />
          </Col>
        </Row>
        {$submitPFSModalView.value.error && (
        <Alert variant="danger" dismissible onClose={() => $submitPFSModalView.update({ error: null })}>
          {$submitPFSModalView.value.error}
        </Alert>
        )}
        <div className="px-32 border-top border-info-100 pt-8">
          <Row>
            <Col xs={12} md={12}>
              <DocumentsContainer
                pdfUrl={$submitPFSModalDetails.value.pdfUrl}
                ocrApplied={$submitPFSModalDetails.value.ocrApplied}
                handleFileUpload={handleFileUploadClick}
                refreshKey={$submitPFSModalView.value.refreshKey}
                $financialDocsUploader={$financialDocsUploader}
                $modalState={$submitPFSModalView}
                handleRemoveDocument={(_$modalState, documentId) => resolvers.handleRemoveDocument(documentId)}
                handleSwitchDocument={(_$modalState, index) => resolvers.handleSwitchDocument(index)}
              />
            </Col>
          </Row>
        </div>
      </Loadable>
    </UniversalModal>
  );
};

export default SubmitPFSModal;
