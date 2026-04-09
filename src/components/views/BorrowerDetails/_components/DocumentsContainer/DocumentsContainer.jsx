import {
  Form,
  Row,
  Col,
  Alert,
  Button,
  Table,
} from 'react-bootstrap';
import { useRef, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagic,
  faTrash,
  faPlus,
  faMinus,
  faChevronLeft,
  faChevronRight,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import FileUploader from '@src/components/global/FileUploader';
import { $borrowerFinancialsForm } from '@src/signals';
import {
  normalizeCurrencyValueAllowNegative,
  normalizePercentageInput,
} from '@src/components/global/Inputs/UniversalInput/_helpers/universalinput.events';
import { $documentsContainerView } from './_helpers/documents.consts';
import * as events from './_helpers/documents.events';
import * as helpers from './_helpers/documents.helpers';
import * as resolvers from './_helpers/documents.resolvers';

// Configure PDF.js worker - using jsdelivr CDN which has proper CORS headers
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DocumentsContainer = ({
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
  const isTaxReturnUploaded = (documentsByType.taxReturn || []).length > 0;
  const {
    excelData,
    isLoadingExcel,
    pdfNumPages,
    pdfPageNumber,
    pdfLoadError,
    pdfBlobUrl,
    pdfZoomScale = 1,
  } = $documentsContainerView.value;

  const pdfBaseWidth = Math.min(window.innerWidth * 0.4, 800);
  const pdfPageWidth = pdfBaseWidth * pdfZoomScale;

  // Memoize PDF options to prevent unnecessary re-renders (must be at component level, not inside conditionals)
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  }), []);

  // Parse Excel file and extract data
  useEffect(() => {
    if (!currentDoc || !helpers.isExcelFile(currentDoc)) {
      resolvers.parseExcelFile(null);
      return;
    }
    resolvers.parseExcelFile(currentDoc);
  }, [currentDoc, pdfUrl]);

  // Create blob URL for newly uploaded files (stored files use storageUrl directly)
  useEffect(() => {
    // For newly uploaded files with File object, create a blob URL
    if (currentDoc?.file) {
      const blobUrl = resolvers.createPdfBlobUrl(currentDoc);
      // Cleanup blob URL on unmount
      return () => {
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }
      };
    }

    // For stored documents, we'll use storageUrl directly (no blob URL needed)
    resolvers.createPdfBlobUrl(currentDoc);
    return undefined;
  }, [currentDoc]);

  // Reset PDF state when URL changes
  useEffect(() => {
    resolvers.resetPdfState();
  }, [pdfUrl, pdfBlobUrl]);

  useEffect(() => {
    if (isTaxReturnUploaded && documentType !== 'taxReturn') {
      $borrowerFinancialsForm.update({ documentType: 'taxReturn' });
    }
  }, [isTaxReturnUploaded, documentType]);

  const renderDocumentPreview = () => {
    // Check if current document is stored but doesn't have a File object
    const isStoredWithoutFile = currentDoc?.isStored && !currentDoc?.file;
    // Check if we have a storageUrl that can be used for preview
    const hasStorageUrl = currentDoc?.storageUrl;

    // If we have a stored document with storageUrl, update pdfUrl if needed
    if (isStoredWithoutFile && hasStorageUrl && pdfUrl !== currentDoc.storageUrl) {
      // Update pdfUrl to use storageUrl for preview
      $modalState.update({ pdfUrl: currentDoc.storageUrl });
      return null; // Will re-render with pdfUrl
    }
    if (!pdfUrl && !hasStorageUrl) {
      return (
        <div>
          {isStoredWithoutFile ? (
            <div className="mb-16">
              <div className="alert alert-info">
                <strong>{currentDoc?.fileName || 'Document'}</strong> was previously uploaded.
                <div className="mt-8 text-info-200">
                  Re-upload the file to preview it in the browser.
                </div>
              </div>
            </div>
          ) : (
            <p className="text-info-200 small mb-16">
              Upload financial statements (PDF, Excel, etc.). Our system will automatically extract financial data.
            </p>
          )}
          <FileUploader
            name="financialDocs"
            signal={$financialDocsUploader}
            acceptedTypes=".pdf,.xlsx,.xls,.doc,.docx,.csv"
            onUpload={handleFileUpload}
          />
        </div>
      );
    }

    if (helpers.isPdfFile(currentDoc)) {
      // If PDF failed to load, show fallback
      if (pdfLoadError) {
        return (
          <div className="text-center py-5 border border-info-600 rounded" style={{ height: '65vh' }}>
            <div className="d-flex flex-column align-items-center justify-content-center h-100">
              <div className="mb-3">
                <i className="fas fa-file-pdf fa-5x text-info-300" />
              </div>
              <h5 className="text-info-100 mb-2">{currentDoc?.fileName || 'PDF Document'}</h5>
              <p className="text-info-300 mb-3">
                Unable to load this PDF. Please open it in a new tab or download it.
              </p>
              <div className="d-flex gap-2">
                <a
                  href={currentDoc?.storageUrl || pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary-100"
                >
                  Open in New Tab
                </a>
                <a
                  href={currentDoc?.storageUrl || pdfUrl}
                  download={currentDoc?.fileName}
                  className="btn btn-outline-primary-100"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        );
      }

      const pdfZoomPercent = Math.round(pdfZoomScale * 100);

      return (
        <div
          className="d-flex flex-column border border-info-600 rounded overflow-hidden"
          style={{ height: '65vh', width: '100%' }}
        >
          {/* PDF + zoom: toolbar is overlaid on the scroll area so rgba/backdrop-filter shows the page through it */}
          <div
            className="position-relative d-flex flex-column flex-grow-1"
            style={{ minHeight: 0 }}
          >
            <div
              className="d-flex justify-content-center align-items-center px-3 py-2 w-100"
              role="toolbar"
              aria-label="PDF zoom"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                pointerEvents: 'auto',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderBottom: '1px solid rgba(65, 105, 108, 0.55)',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center gap-2 flex-shrink-0"
                style={{ maxWidth: 'min(400px, 72vw)' }}
              >
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={events.zoomPdfOut}
                  disabled={pdfZoomScale <= events.PDF_ZOOM_MIN}
                  title="Zoom out"
                  aria-label="Zoom out"
                >
                  <FontAwesomeIcon icon={faMinus} />
                </Button>
                <Form.Range
                  className="my-0 flex-grow-1"
                  style={{
                    width: 'min(220px, 38vw)',
                    minWidth: '80px',
                    accentColor: '#4a9aa7',
                  }}
                  min={events.PDF_ZOOM_MIN_PERCENT}
                  max={events.PDF_ZOOM_MAX_PERCENT}
                  step={5}
                  value={pdfZoomPercent}
                  onChange={events.handlePdfZoomSliderChange}
                  aria-label="Zoom level"
                />
                <span className="text-light small text-nowrap user-select-none" style={{ minWidth: '2.75rem' }}>
                  {pdfZoomPercent}
                  %
                </span>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={events.zoomPdfIn}
                  disabled={pdfZoomScale >= events.PDF_ZOOM_MAX}
                  title="Zoom in"
                  aria-label="Zoom in"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </Button>
                <Button
                  variant="outline-light"
                  size="sm"
                  className="text-nowrap mx-4"
                  onClick={events.resetPdfZoom}
                  disabled={pdfZoomScale === 1}
                  title="Reset zoom to 100%"
                  aria-label="Reset zoom to 100%"
                >
                  Reset
                </Button>
              </div>

              <div className="min-w-0" aria-hidden="true" />
            </div>

            <div
              className="flex-grow-1 overflow-auto position-relative"
              style={{
                minHeight: 0,
                paddingTop: '3.25rem',
                ...(pdfNumPages && pdfNumPages > 1 ? { paddingBottom: '3.25rem' } : {}),
                backgroundColor: '#525252',
                zIndex: 0,
              }}
            >
              <Document
                file={pdfBlobUrl || pdfUrl}
                onLoadSuccess={({ numPages }) => resolvers.handlePdfLoadSuccess(numPages)}
                onLoadError={resolvers.handlePdfLoadError}
                loading={(
                  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                    <div className="text-center">
                      <div className="spinner-border text-info-300 mb-3" role="status">
                        <span className="visually-hidden">Loading PDF...</span>
                      </div>
                      <p className="text-info-100">Loading PDF...</p>
                    </div>
                  </div>
                )}
                options={pdfOptions}
              >
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <Page
                    pageNumber={pdfPageNumber}
                    width={pdfPageWidth}
                    renderTextLayer
                    renderAnnotationLayer
                  />
                </div>
              </Document>
            </div>

            {/* Page nav — overlaid on PDF */}
            {pdfNumPages && pdfNumPages > 1 && (
              <div
                className="d-flex justify-content-between align-items-center px-3 py-2 w-100"
                role="toolbar"
                aria-label="PDF page navigation"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  pointerEvents: 'auto',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderTop: '1px solid rgba(65, 105, 108, 0.55)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                }}
              >
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={events.goToPreviousPage}
                  disabled={pdfPageNumber <= 1}
                  title="Previous page"
                  aria-label="Previous page"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </Button>
                <span className="text-light">
                  Page
                  {' '}
                  {pdfPageNumber}
                  {' '}
                  of
                  {' '}
                  {pdfNumPages}
                </span>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={events.goToNextPage}
                  disabled={pdfPageNumber >= pdfNumPages}
                  title="Next page"
                  aria-label="Next page"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (helpers.isExcelFile(currentDoc)) {
      if (isLoadingExcel) {
        return (
          <div className="text-center py-5 border border-info-600 rounded" style={{ height: '65vh' }}>
            <div className="d-flex flex-column align-items-center justify-content-center h-100">
              <div className="spinner-border text-info-300 mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-info-300">Loading Excel file...</p>
            </div>
          </div>
        );
      }

      if (excelData && excelData.rows.length > 0) {
        return (
          <div style={{ height: '65vh', overflow: 'auto', border: '1px solid #41696C', borderRadius: '8px' }}>
            <div className="p-16 bg-info-700 border-bottom border-info-600">
              <h6 className="text-info-50 mb-0">
                {excelData.worksheetName} - {currentDoc?.fileName || 'Spreadsheet'}
              </h6>
            </div>
            <Table striped bordered hover responsive className="mb-0" style={{ backgroundColor: 'transparent' }}>
              <tbody>
                {excelData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="text-info-50"
                        style={{
                          minWidth: '100px',
                          whiteSpace: 'nowrap',
                          padding: '8px',
                        }}
                      >
                        {cell !== null && cell !== undefined ? String(cell) : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        );
      }

      // Excel file but couldn't parse it
      return (
        <div className="text-center py-5 border border-info-600 rounded" style={{ height: '65vh' }}>
          <div className="d-flex flex-column align-items-center justify-content-center h-100">
            <div className="mb-3">
              <i className={`fas fa-${helpers.getFileIcon(currentDoc)} fa-5x text-info-300`} />
            </div>
            <h5 className="text-info-100 mb-2">{currentDoc?.fileName || 'Document'}</h5>
            <p className="text-info-300 mb-3">
              Unable to preview this Excel file. Please download to view.
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
    }

    return (
      <div className="text-center py-5 border border-info-600 rounded" style={{ height: '65vh' }}>
        <div className="d-flex flex-column align-items-center justify-content-center h-100">
          <div className="mb-3">
            <i className={`fas fa-${helpers.getFileIcon(currentDoc)} fa-5x text-info-300`} />
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
                  onChange={(e) => events.handleDocumentSelectChange(e, handleSwitchDocument, $modalState)}
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
                onClick={() => events.handleRemove(currentDoc, handleRemoveDocument, $modalState)}
                className="me-4"
              >
                <FontAwesomeIcon icon={faTrash} className="me-4" />
                Remove
              </Button>
              <Button
                variant="outline-success-300"
                size="sm"
                onClick={() => events.handleAddFileClick(fileInputRef)}
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
          onChange={(e) => events.handleFileInputChange(e, $financialDocsUploader, handleFileUpload)}
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
            onChange={(e) => events.handleDocumentTypeChange(e, documentsByType, $modalState)}
            className="bg-info-800 text-info-100 border-info-600"
          >
            {!isTaxReturnUploaded && (
              <option value="balanceSheet">
                Balance Sheet
                {documentsByType.balanceSheet.length > 0 ? ` (${documentsByType.balanceSheet.length})` : ''}
              </option>
            )}
            {!isTaxReturnUploaded && (
              <option value="incomeStatement">
                Income Statement
                {documentsByType.incomeStatement.length > 0 ? ` (${documentsByType.incomeStatement.length})` : ''}
              </option>
            )}
            {!isTaxReturnUploaded && (
              <option value="debtServiceWorksheet">
                Debt Schedule
                {documentsByType.debtServiceWorksheet.length > 0 ? ` (${documentsByType.debtServiceWorksheet.length})` : ''}
              </option>
            )}
            <option value="taxReturn">
              Tax Return
              {documentsByType.taxReturn.length > 0 ? ` (${documentsByType.taxReturn.length})` : ''}
            </option>
          </Form.Select>
          {isTaxReturnUploaded && (
            <Form.Text className="text-warning-300">
              Tax return uploaded. Other document types are hidden for this submission.
            </Form.Text>
          )}
          {documentsByType[documentType].length === 0 && (
            <Form.Text className="text-info-300">
              No documents uploaded for this type yet.
            </Form.Text>
          )}
        </Form.Group>

        {ocrApplied && pdfUrl && !$modalState.value.isLoadingInputData && (
          <Alert variant="success" className="mb-16">
            <FontAwesomeIcon icon={faMagic} className="me-8" />
            Financial data extracted from documents and populated below. Please review and adjust as needed.
          </Alert>
        )}
        {$modalState.value.isLoadingInputData && (
          <Alert variant="success" className="mb-16">
            <FontAwesomeIcon icon={faSpinner} className="me-8" spin />
            Loading financial data...
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
                />
              </Col>

              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Cash & Cash Equivalents"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.cashEquivalents}
                  name="cashEquivalents"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Total Assets"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.totalAssets}
                  name="totalAssets"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Total Liabilities"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.totalLiabilities}
                  name="totalLiabilities"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Gross Profit Margin (%)"
                  labelClassName="text-info-100"
                  type="percentage"
                  placeholder="15.5%"
                  value={$borrowerFinancialsForm.value.profitMargin}
                  name="profitMargin"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizePercentageInput}
                />
              </Col>
            </Row>
          )}

          {/* Debt Schedule Fields */}
          {documentType === 'debtServiceWorksheet' && (
            <Row>
              <Col md={12} className="mb-16">
                <Form.Text className="text-info-300">
                  Debt service worksheet functionality coming soon.
                </Form.Text>
              </Col>
            </Row>
          )}

          {/* Tax Return Fields */}
          {documentType === 'taxReturn' && (
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Gross Profit Margin (%)"
                  labelClassName="text-info-100"
                  type="percentage"
                  placeholder="15.5%"
                  value={$borrowerFinancialsForm.value.profitMargin}
                  name="profitMargin"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizePercentageInput}
                />
              </Col>

              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Equity"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.equity}
                  name="equity"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Cash & Cash Equivalents"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.cashEquivalents}
                  name="cashEquivalents"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Total Assets"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.totalAssets}
                  name="totalAssets"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Total Liabilities"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.totalLiabilities}
                  name="totalLiabilities"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
                />
              </Col>
              <Col md={12} className="mb-16">
                <UniversalInput
                  label="Liquidity"
                  labelClassName="text-info-100"
                  type="currency"
                  placeholder="$ USD"
                  value={$borrowerFinancialsForm.value.liquidity}
                  name="liquidity"
                  signal={$borrowerFinancialsForm}
                  inputFormatCallback={normalizeCurrencyValueAllowNegative}
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

export default DocumentsContainer;
