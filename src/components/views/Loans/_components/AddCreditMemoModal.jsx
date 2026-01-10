import { useEffect, useState, useMemo } from 'react';
import { Alert, Button, Row, Col, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic, faTrash, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Document, Page, pdfjs } from 'react-pdf';
import ExcelJS from 'exceljs';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
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

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const AddCreditMemoModal = () => {
  // Force re-render when refreshKey changes
  const [localRefreshKey, setLocalRefreshKey] = useState(0);
  const [pdfNumPages, setPdfNumPages] = useState(null);
  const [pdfPageNumber, setPdfPageNumber] = useState(1);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [isLoadingExcel, setIsLoadingExcel] = useState(false);

  useEffect(() => {
    // Poll for signal updates and force re-render when refreshKey changes
    const interval = setInterval(() => {
      if ($creditMemoModalState.value.refreshKey !== localRefreshKey) {
        setLocalRefreshKey($creditMemoModalState.value.refreshKey);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [localRefreshKey]);

  const { showModal } = $creditMemoView.value;
  const { ocrApplied, isSubmitting, error, pdfUrl, uploadedDocument } = $creditMemoModalState.value;

  // Modal title and button text
  const modalTitle = 'Add Credit Memo';
  const submitButtonText = isSubmitting ? 'Submitting...' : 'Submit';

  // PDF.js options
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  }), []);

  // Reset PDF state when URL changes
  useEffect(() => {
    setPdfLoadError(false);
    setPdfPageNumber(1);
    setPdfNumPages(null);
  }, [pdfUrl]);

  const isPdfFile = (doc) => {
    if (!doc) return false;
    const mimeType = doc.mimeType || '';
    const fileName = doc.fileName || '';
    return mimeType === 'application/pdf'
      || mimeType === 'application/x-pdf'
      || mimeType === 'application/x-bzpdf'
      || mimeType === 'application/x-gzpdf'
      || fileName.match(/\.pdf$/i);
  };

  const isExcelFile = (doc) => {
    if (!doc) return false;
    const mimeType = doc.mimeType || '';
    const fileName = doc.fileName || '';
    return mimeType.includes('spreadsheet')
      || fileName.match(/\.(xlsx?|xls)$/i)
      || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      || mimeType === 'application/vnd.ms-excel';
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

  // Parse Excel file and extract data
  useEffect(() => {
    const parseExcelFile = async () => {
      if (!uploadedDocument || !isExcelFile(uploadedDocument)) {
        setExcelData(null);
        return;
      }

      setIsLoadingExcel(true);
      try {
        const workbook = new ExcelJS.Workbook();
        let buffer;

        if (uploadedDocument.file) {
          // For newly uploaded files, use the File object
          buffer = await uploadedDocument.file.arrayBuffer();
        } else {
          setExcelData(null);
          setIsLoadingExcel(false);
          return;
        }

        await workbook.xlsx.load(buffer);

        // Get the first worksheet
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          setExcelData(null);
          setIsLoadingExcel(false);
          return;
        }

        // Convert worksheet to array of rows
        const rows = [];
        worksheet.eachRow((row) => {
          const rowData = [];
          row.eachCell({ includeEmpty: true }, (cell) => {
            let { value } = cell;
            // Handle different cell value types
            if (value === null || value === undefined) {
              value = '';
            } else if (typeof value === 'object') {
              // Handle formulas, rich text, etc.
              if (value.text !== undefined) {
                value = value.text;
              } else if (value.result !== undefined) {
                value = value.result;
              } else {
                value = String(value);
              }
            }
            rowData.push(value);
          });
          rows.push(rowData);
        });

        setExcelData({
          worksheetName: worksheet.name,
          rows,
          columnCount: worksheet.columnCount,
        });
      } catch (err) {
        console.error('Error parsing Excel file:', err);
        setExcelData(null);
      } finally {
        setIsLoadingExcel(false);
      }
    };

    parseExcelFile();
  }, [uploadedDocument, pdfUrl]);

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

    // Handle Excel files
    if (isExcelFile(uploadedDocument)) {
      if (isLoadingExcel) {
        return (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '65vh' }}>
            <div className="text-center">
              <div className="spinner-border text-info-300 mb-3" role="status">
                <span className="visually-hidden">Loading Excel...</span>
              </div>
              <p className="text-info-100">Parsing Excel file...</p>
            </div>
          </div>
        );
      }

      if (excelData && excelData.rows.length > 0) {
        return (
          <div style={{ height: '65vh', overflow: 'auto', border: '1px solid #41696C', borderRadius: '8px' }}>
            <div className="p-16 bg-info-700 border-bottom border-info-600">
              <h6 className="text-info-50 mb-0">
                {excelData.worksheetName} - {uploadedDocument?.fileName || 'Spreadsheet'}
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
              <i className="fas fa-file-excel fa-5x text-info-300" />
            </div>
            <h5 className="text-info-100 mb-2">{uploadedDocument?.fileName || 'Document'}</h5>
            <p className="text-info-300 mb-3">
              Unable to preview this Excel file. Please download to view.
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
    }

    // Handle PDF files
    if (isPdfFile(uploadedDocument)) {
      if (pdfLoadError) {
        return (
          <div className="text-center py-5 border border-danger rounded" style={{ height: '65vh' }}>
            <div className="d-flex flex-column align-items-center justify-content-center h-100">
              <div className="mb-3">
                <i className="fas fa-exclamation-triangle fa-5x text-danger" />
              </div>
              <h5 className="text-info-100 mb-2">Error Loading PDF</h5>
              <p className="text-info-300 mb-3">
                Unable to display this PDF. Please try downloading it instead.
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
      }

      return (
        <div style={{ height: '65vh', width: '100%', position: 'relative' }}>
          <div
            style={{
              height: '100%',
              width: '100%',
              overflow: 'auto',
              border: '1px solid #41696C',
              borderRadius: '8px',
              backgroundColor: '#525252',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => {
                setPdfNumPages(numPages);
                setPdfLoadError(false);
              }}
              onLoadError={(err) => {
                console.error('Error loading PDF:', err);
                setPdfLoadError(true);
              }}
              loading={(
                <div className="d-flex justify-content-center align-items-center" style={{ height: '65vh' }}>
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
                  width={Math.min(window.innerWidth * 0.4, 800)}
                  renderTextLayer
                  renderAnnotationLayer
                />
              </div>
            </Document>
          </div>

          {/* PDF Navigation Controls */}
          {pdfNumPages && pdfNumPages > 1 && (
            <div
              className="d-flex justify-content-between align-items-center px-3 py-2"
              style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderBottomLeftRadius: '8px',
                borderBottomRightRadius: '8px',
              }}
            >
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => setPdfPageNumber((prev) => Math.max(1, prev - 1))}
                disabled={pdfPageNumber <= 1}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </Button>
              <span className="text-light">
                Page {pdfPageNumber} of {pdfNumPages}
              </span>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => setPdfPageNumber((prev) => Math.min(pdfNumPages, prev + 1))}
                disabled={pdfPageNumber >= pdfNumPages}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </Button>
            </div>
          )}
        </div>
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
                  className="me-4"
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
