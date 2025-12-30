import { Form, Row, Col, Alert, Button } from 'react-bootstrap';
import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import FileUploader from '@src/components/global/FileUploader';
import { $borrowerFinancialsForm } from '@src/signals';
import { normalizeCurrencyValue, normalizeCurrencyValueNoCents } from '@src/components/global/Inputs/UniversalInput/_helpers/universalinput.events';

const DocumentsTab = ({
  pdfUrl,
  ocrApplied,
  handleFileUpload,
  refreshKey,
  $financialDocsUploader,
  $modalState,
  handleRemoveDocument,
  handleSwitchDocument,
}) => {
  const { documentType } = $borrowerFinancialsForm.value;
  const { documentsByType, currentDocumentIndex } = $modalState.value;
  const fileInputRef = useRef(null);

  const currentDocs = documentsByType[documentType] || [];
  const currentIndex = currentDocumentIndex[documentType] || 0;
  const currentDoc = currentDocs[currentIndex];
  const hasMultipleDocs = currentDocs.length > 1;

  const handleDocumentTypeChange = (e) => {
    const newType = e.target.value;
    $borrowerFinancialsForm.update({ documentType: newType });

    // Switch to the first document of the new type if available, or clear the view
    const newTypeDocs = documentsByType[newType] || [];
    if (newTypeDocs.length > 0) {
      // Update the modal state to show the first document of the new type
      $modalState.update({
        pdfUrl: newTypeDocs[0].previewUrl,
        currentDocumentIndex: {
          ...$modalState.value.currentDocumentIndex,
          [newType]: 0,
        },
      });
    } else {
      // No documents for this type, clear the PDF view
      $modalState.update({
        pdfUrl: null,
        currentDocumentIndex: {
          ...$modalState.value.currentDocumentIndex,
          [newType]: 0,
        },
      });
    }
  };

  const handleDocumentSelectChange = (e) => {
    const newIndex = parseInt(e.target.value, 10);
    if (!Number.isNaN(newIndex)) {
      handleSwitchDocument($modalState, newIndex);
    }
  };

  const handleRemove = () => {
    if (currentDoc) {
      handleRemoveDocument($modalState, currentDoc.id);
    }
  };

  const handleAddFileClick = () => {
    fileInputRef.current?.click();
  };

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
            Upload financial statements (PDF, Excel, etc.). Our system will automatically extract financial data.
          </p>
          <FileUploader
            name="financialDocs"
            signal={$financialDocsUploader}
            acceptedTypes=".pdf,.xlsx,.xls,.doc,.docx,.csv"
            onUpload={handleFileUpload}
          />
        </div>
      );
    }

    if (isPdfFile(currentDoc)) {
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
            <i className={`fas fa-${getFileIcon(currentDoc)} fa-5x text-info-300`} />
          </div>
          <h5 className="text-info-100 mb-2">{currentDoc?.fileName || 'Document'}</h5>
          <p className="text-info-300 mb-3">
            This file type cannot be previewed in the browser.
          </p>
          <a
            href={pdfUrl}
            download={currentDoc?.fileName}
            className="btn btn-primary-100"
          >
            Download File
          </a>
        </div>
      </div>
    );
  };

  return (
    <Row>
      <Col md={7} className="ps-0">
        <div className="d-flex justify-content-between align-items-center mb-16">
          <h5 className="text-info-100 mb-0 fw-600">
            {pdfUrl ? 'Uploaded Document' : 'Upload Financial Documents'}
          </h5>

          {pdfUrl && (
            <div className="d-flex align-items-center gap-2">
              {hasMultipleDocs && (
                <Form.Select
                  size="sm"
                  value={currentIndex}
                  onChange={handleDocumentSelectChange}
                  className="bg-info-800 text-info-100 border-info-600 me-4 rounded-pill"
                  style={{ width: 'auto', minWidth: '150px' }}
                >
                  {currentDocs.map((doc, idx) => (
                    <option key={doc.id} value={idx}>
                      Document {idx + 1} of {currentDocs.length}
                    </option>
                  ))}
                </Form.Select>
              )}
              <Button
                variant="outline-danger-300"
                size="sm"
                onClick={handleRemove}
                className="me-4"
              >
                <FontAwesomeIcon icon={faTrash} className="me-4" />
                Remove
              </Button>
              <Button
                variant="outline-success-300"
                size="sm"
                onClick={handleAddFileClick}
              >
                <FontAwesomeIcon icon={faPlus} className="me-4" />
                Add File
              </Button>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          accept=".pdf,.xlsx,.xls,.doc,.docx,.csv"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              $financialDocsUploader.update({ financialDocs: files });
              handleFileUpload();
              // Reset the input so the same file can be selected again
              e.target.value = '';
            }
          }}
        />

        {renderDocumentPreview()}
      </Col>

      <Col
        md={5}
        className="pe-0"
        style={{ maxHeight: '75vh', overflowY: 'auto', overflowX: 'hidden' }}
      >
        {/* Document Type Selector */}
        <Form.Group className="mb-16 border-bottom border-info-100 pb-16">
          <h5 className="text-info-100 mb-16 fw-600">Document Type</h5>
          <Form.Select
            value={documentType}
            onChange={handleDocumentTypeChange}
            className="bg-info-800 text-info-100 border-info-600"
          >
            <option value="balanceSheet">
              Balance Sheet
              {documentsByType.balanceSheet.length > 0 ? ` (${documentsByType.balanceSheet.length})` : ''}
            </option>
            <option value="incomeStatement">
              Income Statement
              {documentsByType.incomeStatement.length > 0 ? ` (${documentsByType.incomeStatement.length})` : ''}
            </option>
            <option value="debtServiceWorksheet">
              Debt Service Worksheet
              {documentsByType.debtServiceWorksheet.length > 0 ? ` (${documentsByType.debtServiceWorksheet.length})` : ''}
            </option>
          </Form.Select>
          {documentsByType[documentType].length === 0 && (
            <Form.Text className="text-info-300">
              No documents uploaded for this type yet.
            </Form.Text>
          )}
        </Form.Group>

        {ocrApplied && pdfUrl && (
          <Alert variant="success" className="mb-16">
            <FontAwesomeIcon icon={faMagic} className="me-8" />
            Financial data extracted from documents and populated below. Please review and adjust as needed.
          </Alert>
        )}

        <Form key={refreshKey}>
          {/* Balance Sheet Fields */}
          {documentType === 'balanceSheet' && (
            <Row>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Equity"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.equity}
                  name="equity"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValue}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Cash (Including Cash Equivalents)"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.cash}
                  name="cash"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValue}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Cash Equivalents"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.cashEquivalents}
                  name="cashEquivalents"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValue}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Accounts Receivable"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.accountsReceivable}
                  name="accountsReceivable"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValue}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Inventory"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.inventory}
                  name="inventory"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValue}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Total Current Assets"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.totalCurrentAssets}
                  name="totalCurrentAssets"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValue}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Accounts Payable"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.accountsPayable}
                  name="accountsPayable"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValue}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Total Current Liabilities"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.totalCurrentLiabilities}
                  name="totalCurrentLiabilities"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValue}
                />
              </Col>
            </Row>
          )}

          {/* Income Statement Fields */}
          {documentType === 'incomeStatement' && (
            <Row>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Gross Revenue"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.grossRevenue}
                  name="grossRevenue"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValueNoCents}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Net Income"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.netIncome}
                  name="netIncome"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValueNoCents}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="EBITDA"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.ebitda}
                  name="ebitda"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValueNoCents}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Rental Expenses"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.rentalExpenses}
                  name="rentalExpenses"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValueNoCents}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Profit Margin (%)"
                  labelClassName="text-info-100"
                  type="number"
                  step="0.01"
                  placeholder="15.5"
                  value={$borrowerFinancialsForm.value.profitMargin}
                  name="profitMargin"
                  signal={$borrowerFinancialsForm}
                />
              </Col>
            </Row>
          )}

          {/* Debt Service Worksheet Fields */}
          {documentType === 'debtServiceWorksheet' && (
            <Row>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Debt Service Ratio"
                  labelClassName="text-info-100"
                  type="number"
                  step="0.01"
                  placeholder="1.45"
                  value={$borrowerFinancialsForm.value.debtService}
                  name="debtService"
                  signal={$borrowerFinancialsForm}
                />
              </Col>
            </Row>
          )}

          <hr className="my-16 border-info-700" />

          {/* Notes - Always show */}
          <h5 className="text-info-100 mb-16 fw-600">Notes</h5>
          <Row>
            <Col md={12} className="mb-16">
              <UniversalInput
                label="Additional Notes"
                labelClassName="text-info-100"
                type="text"
                placeholder="Additional notes or comments"
                value={$borrowerFinancialsForm.value.notes}
                name="notes"
                signal={$borrowerFinancialsForm}
              />
            </Col>
          </Row>
        </Form>
      </Col>
    </Row>
  );
};

export default DocumentsTab;
