import { useEffect } from 'react';
import { Alert, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import FileUploader from '@src/components/global/FileUploader/FileUploader';
import { formatCurrency } from '@src/utils/formatCurrency';
import { $loanCollateralView, $loanCollateralForm, $collateralDocUploader, $collateralModalState } from './submitCollateralModal.signals';
import {
  handleClose,
  handleSubmit,
  handleOpenModal,
  handleAddCollateralItem,
  handleRemoveCollateralItem,
  handleUpdateCollateralItem,
  handleFileUpload,
  handleRemoveDocument,
  handleDownloadDocument,
  calculateTotalValue,
} from './submitCollateralModal.handlers';

const SubmitCollateralModal = () => {
  const { showSubmitModal, isEditMode } = $loanCollateralView.value;
  const { collateralItems, asOfDate, notes } = $loanCollateralForm.value;
  const { isSubmitting, error, uploadedDocument } = $collateralModalState.value;

  // Load existing collateral when modal opens in edit mode
  useEffect(() => {
    if (showSubmitModal) {
      handleOpenModal();
    }
  }, [showSubmitModal]);

  // Calculate total value
  const totalValue = calculateTotalValue();

  // Modal title and button text
  const modalTitle = isEditMode ? 'Update Collateral Value' : 'Submit Collateral Value';
  let submitButtonText;
  if (isSubmitting) {
    submitButtonText = isEditMode ? 'Updating...' : 'Submitting...';
  } else {
    submitButtonText = isEditMode ? 'Update' : 'Submit';
  }

  return (
    <UniversalModal
      show={showSubmitModal}
      onHide={handleClose}
      headerText={modalTitle}
      leftBtnText="Cancel"
      rightBtnText={submitButtonText}
      rightBtnOnClick={handleSubmit}
      rightButtonDisabled={isSubmitting}
      size="lg"
      closeButton
    >
      <div className="pt-16">
        {error && (
          <Alert variant="danger" dismissible onClose={() => $collateralModalState.update({ error: null })}>
            {error}
          </Alert>
        )}

        {/* As Of Date */}
        <Row className="mb-12 mb-md-16">
          <Col xs={12} md={6}>
            <UniversalInput
              label="As Of Date (Valuation Date)"
              labelClassName="text-info-100"
              type="date"
              placeholder="YYYY-MM-DD"
              value={asOfDate}
              name="asOfDate"
              signal={$loanCollateralForm}
              required
            />
          </Col>
        </Row>

        {/* Collateral Items Section */}
        <div className="mb-16">
          <div className="d-flex justify-content-between align-items-center mb-12">
            <h5 className="mb-0">Collateral Items</h5>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleAddCollateralItem}
            >
              <FontAwesomeIcon icon={faPlus} className="me-8" />
              Add Item
            </Button>
          </div>

          {collateralItems.map((item, index) => (
            <Row key={index} className="mb-12 align-items-end">
              <Col xs={12} md={6} className="mb-12 mb-md-0">
                <UniversalInput
                  label="Description"
                  labelClassName="text-info-100"
                  type="text"
                  placeholder="e.g., Real Estate, Equipment, Inventory"
                  value={item.description}
                  customOnChange={(e) => handleUpdateCollateralItem(index, 'description', e.target.value)}
                />
              </Col>
              <Col md={4}>
                <UniversalInput
                  label="Value"
                  labelClassName="text-info-100"
                  type="number"
                  placeholder="0.00"
                  value={item.value}
                  customOnChange={(e) => handleUpdateCollateralItem(index, 'value', e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemoveCollateralItem(index)}
                  disabled={collateralItems.length <= 1}
                  className="w-100"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </Col>
            </Row>
          ))}

          {/* Total Value Display */}
          <div className="mt-16 fw-bold pt-8 border-top border-info-700">
            <div className="d-flex justify-content-between align-items-center">
              <div className="mb-0 text-info-100">Total Collateral Value:</div>
              <div className="mb-0 text-success-300 fs-6">
                <FontAwesomeIcon icon={faDollarSign} className="me-8" />
                {formatCurrency(totalValue)}
              </div>
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="mb-16">
          <h5 className="mb-12">Supporting Document (Optional)</h5>

          {!uploadedDocument ? (
            <FileUploader
              name="collateralDoc"
              signal={$collateralDocUploader}
              acceptedTypes=".pdf,.doc,.docx,.xls,.xlsx"
              onUpload={handleFileUpload}
            />
          ) : (
            <div className="p-16 bg-info-700 border rounded">
              <div className="d-flex justify-content-between align-items-center">
                <Button
                  variant="link"
                  onClick={handleDownloadDocument}
                  style={{ cursor: 'pointer', flex: 1, padding: 0, textAlign: 'left' }}
                  className="text-decoration-none"
                  title="Click to download"
                >
                  <div className="fw-bold text-primary-100">{uploadedDocument.fileName}</div>
                  <div className="text-info-900 small">
                    {(uploadedDocument.fileSize / 1024).toFixed(2)} KB • Click to download
                  </div>
                </Button>
                <Button
                  variant="outline-danger-200"
                  size="sm"
                  onClick={handleRemoveDocument}
                >
                  <FontAwesomeIcon icon={faTrash} className="me-8" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <Row>
          <Col md={12}>
            <UniversalInput
              label="Notes (Optional)"
              labelClassName="text-info-100"
              type="textarea"
              placeholder="Add any additional notes about this valuation..."
              value={notes}
              name="notes"
              signal={$loanCollateralForm}
              rows={4}
            />
          </Col>
        </Row>
      </div>
    </UniversalModal>
  );
};

export default SubmitCollateralModal;
