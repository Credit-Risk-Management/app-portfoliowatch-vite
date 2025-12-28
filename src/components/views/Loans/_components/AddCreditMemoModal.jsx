import { Alert, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic, faTrash } from '@fortawesome/free-solid-svg-icons';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import FileUploader from '@src/components/global/FileUploader';
import { normalizeCurrencyValue } from '@src/components/global/Inputs/UniversalInput/_helpers/universalinput.events';
import { $creditMemoView, $creditMemoForm, $creditMemoDocsUploader, $creditMemoModalState } from './addCreditMemoModal.signals';
import {
  handleClose,
  handleSubmit,
  handleFileUpload,
  handleRemoveDocument,
  handleDownloadDocument,
} from './addCreditMemoModal.handlers';

const AddCreditMemoModal = () => {
  const { showModal } = $creditMemoView.value;
  const { ocrApplied, isSubmitting, error, pdfUrl, uploadedDocument } = $creditMemoModalState.value;

  // Modal title and button text
  const modalTitle = 'Add Credit Memo';
  const submitButtonText = isSubmitting ? 'Submitting...' : 'Submit';

  const isPdfFile = (doc) => {
    if (!doc) return false;
    return doc.mimeType === 'application/pdf' || doc.fileName?.toLowerCase().endsWith('.pdf');
  };

  const getFileIcon = (doc) => {
    if (!doc) return 'file';
    const mimeType = doc.mimeType || '';
    const fileName = doc.fileName || '';

    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) return 'file-pdf';
    if (mimeType.includes('spreadsheet') || fileName.match(/\.(xlsx?|csv)$/i)) return 'file-excel';
    if (mimeType.includes('word') || fileName.match(/\.docx?$/i)) return 'file-word';
    return 'file';
  };

  const renderDocumentPreview = () => {
    if (!pdfUrl) {
      return (
        <div>
          <p className="text-info-200 small mb-16">
            Upload a credit memo document (PDF, Excel, etc.). Our system will automatically extract covenant data.
          </p>
          <FileUploader
            name="creditMemoDocs"
            signal={$creditMemoDocsUploader}
            acceptedTypes=".pdf,.xlsx,.xls,.doc,.docx"
            onUpload={handleFileUpload}
          />
        </div>
      );
    }

    if (isPdfFile(uploadedDocument)) {
      return (
        <object
          data={pdfUrl}
          type="application/pdf"
          width="100%"
          style={{ height: '65vh' }}
        >
          <p>
            Cannot display document.{' '}
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              Download
            </a>{' '}
            instead.
          </p>
        </object>
      );
    }

    return (
      <div className="text-center py-5 border border-info-600 rounded" style={{ height: '65vh' }}>
        <div className="d-flex flex-column align-items-center justify-content-center h-100">
          <div className="mb-3">
            <i className={`fas fa-${getFileIcon(uploadedDocument)} fa-5x text-info-300`} />
          </div>
          <h5 className="text-info-100 mb-2">{uploadedDocument?.fileName || 'Document'}</h5>
          <p className="text-info-300 mb-3">
            This file type cannot be previewed in the browser.
          </p>
          <Button
            variant="primary-100"
            onClick={handleDownloadDocument}
          >
            Download File
          </Button>
        </div>
      </div>
    );
  };

  return (
    <UniversalModal
      show={showModal}
      onHide={handleClose}
      headerText={modalTitle}
      leftBtnText="Cancel"
      rightBtnText={submitButtonText}
      rightBtnOnClick={handleSubmit}
      rightButtonDisabled={isSubmitting}
      size="fullscreen"
      closeButton
    >
      <div className="pt-16">
        {error && (
          <Alert variant="danger" dismissible onClose={() => $creditMemoModalState.update({ error: null })}>
            {error}
          </Alert>
        )}

        {/* Document Preview and Form in Side-by-Side Layout */}
        <Row className="my-16">
          <Col md={7} className="ps-0">
            <div className="d-flex justify-content-between align-items-center mb-16">
              <h5 className="text-info-100 mb-0 fw-600">
                {pdfUrl ? 'Uploaded Document' : 'Upload Credit Memo'}
              </h5>

              {pdfUrl && (
                <Button
                  variant="outline-danger-300"
                  size="sm"
                  onClick={handleRemoveDocument}
                >
                  <FontAwesomeIcon icon={faTrash} className="me-4" />
                  Remove
                </Button>
              )}
            </div>

            {renderDocumentPreview()}
          </Col>

          <Col
            md={5}
            className="pe-0"
            style={{ maxHeight: '75vh', overflowY: 'auto', overflowX: 'hidden' }}
          >
            <h5 className="text-info-100 mb-16 fw-600">Covenant Values</h5>

            {ocrApplied && pdfUrl && (
              <Alert variant="success" className="mb-16">
                <FontAwesomeIcon icon={faMagic} className="me-8" />
                Covenant data extracted from document and populated below. Please review and adjust as needed.
              </Alert>
            )}

            <UniversalInput
              label="As Of Date"
              labelClassName="text-info-100"
              className="mb-8"
              type="date"
              placeholder="YYYY-MM-DD"
              value={$creditMemoForm.value.asOfDate}
              name="asOfDate"
              signal={$creditMemoForm}
              required
            />
            <UniversalInput
              label="Debt Service Coverage Ratio"
              labelClassName="text-info-100"
              className="mb-8"
              type="number"
              step="0.01"
              placeholder="1.45"
              value={$creditMemoForm.value.debtService}
              name="debtService"
              signal={$creditMemoForm}
            />

            <UniversalInput
              label="Current Ratio"
              labelClassName="text-info-100"
              className="mb-8"
              type="number"
              step="0.01"
              placeholder="2.50"
              value={$creditMemoForm.value.currentRatio}
              name="currentRatio"
              signal={$creditMemoForm}
            />
            <UniversalInput
              label="Liquidity Total"
              labelClassName="text-info-100"
              className="mb-8"
              type="currency"
              placeholder="$ USD"
              value={$creditMemoForm.value.liquidity}
              name="liquidity"
              signal={$creditMemoForm}
              inputFormatCallback={normalizeCurrencyValue}
            />
            <UniversalInput
              label="Liquidity Ratio"
              labelClassName="text-info-100"
              className="mb-8"
              type="number"
              step="0.01"
              placeholder="1.75"
              value={$creditMemoForm.value.liquidityRatio}
              name="liquidityRatio"
              signal={$creditMemoForm}
            />

            <hr className="my-16 border-info-700" />

            {/* Notes */}
            <h5 className="text-info-100 mb-16 fw-600">Notes</h5>
            <Row>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Additional Notes"
                  labelClassName="text-info-100"
                  className="mb-8"
                  type="textarea"
                  placeholder="Additional notes or comments"
                  value={$creditMemoForm.value.notes}
                  name="notes"
                  signal={$creditMemoForm}
                  rows={4}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </UniversalModal>
  );
};

export default AddCreditMemoModal;
