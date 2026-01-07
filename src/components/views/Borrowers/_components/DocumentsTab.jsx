import { Form, Row, Col, Alert, Button, Table } from 'react-bootstrap';
import { useRef, useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic, faTrash, faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import ExcelJS from 'exceljs';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import FileUploader from '@src/components/global/FileUploader';
import { $borrowerFinancialsForm } from '@src/signals';
import { normalizeCurrencyValue, normalizeCurrencyValueNoCents } from '@src/components/global/Inputs/UniversalInput/_helpers/universalinput.events';
import { auth } from '@src/utils/firebase';

// Configure PDF.js worker - using jsdelivr CDN which has proper CORS headers
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  const [excelData, setExcelData] = useState(null);
  const [isLoadingExcel, setIsLoadingExcel] = useState(false);
  const [pdfNumPages, setPdfNumPages] = useState(null);
  const [pdfPageNumber, setPdfPageNumber] = useState(1);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  // Memoize PDF options to prevent unnecessary re-renders (must be at component level, not inside conditionals)
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  }), []);

  const handleDocumentTypeChange = (e) => {
    const newType = e.target.value;
    $borrowerFinancialsForm.update({ documentType: newType });

    // Switch to the first document of the new type if available, or clear the view
    const newTypeDocs = documentsByType[newType] || [];
    if (newTypeDocs.length > 0) {
      const firstDoc = newTypeDocs[0];
      // Use storageUrl if previewUrl is not available (for stored documents)
      const docUrl = firstDoc.previewUrl || firstDoc.storageUrl || null;
      // Update the modal state to show the first document of the new type
      $modalState.update({
        pdfUrl: docUrl,
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
    const mimeType = doc.mimeType || '';
    const fileName = doc.fileName || '';
    // Check for PDF MIME type (with common variations) or file extension
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

  // Parse Excel file and extract data
  useEffect(() => {
    const parseExcelFile = async () => {
      if (!currentDoc || !isExcelFile(currentDoc)) {
        setExcelData(null);
        return;
      }

      setIsLoadingExcel(true);
      try {
        const workbook = new ExcelJS.Workbook();
        let buffer;

        // For stored documents, download via backend proxy
        if (currentDoc.isStored && currentDoc.id) {
          const proxyUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333'}/borrower-financial-documents/${currentDoc.id}/proxy`;
          const response = await fetch(proxyUrl, {
            headers: {
              'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
            },
          });
          const blob = await response.blob();
          buffer = await blob.arrayBuffer();
        } else if (currentDoc.file) {
          // For newly uploaded files, use the File object
          buffer = await currentDoc.file.arrayBuffer();
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
        worksheet.eachRow((row, rowNumber) => {
          const rowData = [];
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            let value = cell.value;
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
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        setExcelData(null);
      } finally {
        setIsLoadingExcel(false);
      }
    };

    parseExcelFile();
  }, [currentDoc, pdfUrl]);

  // Fetch PDF/Excel from Firebase Storage and create blob URL
  useEffect(() => {
    const fetchBlob = async () => {
      if (!currentDoc) {
        setPdfBlobUrl(null);
        return;
      }

      // For newly uploaded files with File object
      if (currentDoc.file) {
        const blobUrl = URL.createObjectURL(currentDoc.file);
        setPdfBlobUrl(blobUrl);
        return;
      }

      // For stored documents, download via backend proxy (bypasses CORS!)
      if (currentDoc.isStored && currentDoc.id) {
        try {
          const proxyUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333'}/borrower-financial-documents/${currentDoc.id}/proxy`;
          const response = await fetch(proxyUrl, {
            headers: {
              'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
            },
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          setPdfBlobUrl(blobUrl);
          setPdfLoadError(false);
        } catch (error) {
          console.error('Error downloading document:', error);
          setPdfLoadError(true);
        }
      } else {
        setPdfBlobUrl(null);
      }
    };

    fetchBlob();

    // Cleanup blob URL on unmount
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [currentDoc]);

  // Reset PDF state when URL changes
  useEffect(() => {
    setPdfLoadError(false);
    setPdfPageNumber(1);
    setPdfNumPages(null);
  }, [pdfUrl, pdfBlobUrl]);

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

    if (isPdfFile(currentDoc)) {
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
              file={pdfBlobUrl || pdfUrl}
              onLoadSuccess={({ numPages }) => {
                setPdfNumPages(numPages);
                setPdfLoadError(false);
              }}
              onLoadError={(error) => {
                console.error('Error loading PDF:', error);
                setPdfLoadError(true);
              }}
              loading={
                <div className="d-flex justify-content-center align-items-center" style={{ height: '65vh' }}>
                  <div className="text-center">
                    <div className="spinner-border text-info-300 mb-3" role="status">
                      <span className="visually-hidden">Loading PDF...</span>
                    </div>
                    <p className="text-info-100">Loading PDF...</p>
                  </div>
                </div>
              }
              options={pdfOptions}
            >
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <Page
                  pageNumber={pdfPageNumber}
                  width={Math.min(window.innerWidth * 0.4, 800)}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
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

    if (isExcelFile(currentDoc)) {
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
              <i className={`fas fa-${getFileIcon(currentDoc)} fa-5x text-info-300`} />
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
