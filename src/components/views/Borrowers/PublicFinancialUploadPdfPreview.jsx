import { Form, Button } from 'react-bootstrap';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinus,
  faPlus,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  $publicIncomeStatementUploader,
  $publicBalanceSheetUploader,
  $publicCashFlowUploader,
  $publicOtherFinancialsUploader,
  $publicDebtScheduleUploader,
} from './_helpers/publicFinancialUpload.consts';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const UPLOADER_BY_SECTION = {
  incomeStatement: $publicIncomeStatementUploader,
  balanceSheet: $publicBalanceSheetUploader,
  incomeStatementQuarterly: $publicCashFlowUploader,
  businessTaxReturn: $publicOtherFinancialsUploader,
  debtSchedule: $publicDebtScheduleUploader,
};

const PDF_ZOOM_MIN = 0.5;
const PDF_ZOOM_MAX = 3;
const PDF_ZOOM_STEP = 0.25;
const PDF_ZOOM_MIN_PERCENT = Math.round(PDF_ZOOM_MIN * 100);
const PDF_ZOOM_MAX_PERCENT = Math.round(PDF_ZOOM_MAX * 100);

const clampZoom = (scale) => Math.max(
  PDF_ZOOM_MIN,
  Math.min(PDF_ZOOM_MAX, Math.round(scale * 100) / 100),
);

/**
 * PDF preview for one public-upload section (independent zoom/page state per row).
 *
 * @param {{ sectionId: 'incomeStatement'|'balanceSheet' }} props
 */
export default function PublicFinancialUploadPdfPreview({ sectionId }) {
  const uploader = UPLOADER_BY_SECTION[sectionId];
  const file = (uploader?.value?.financialDocs || [])[0];
  const fileKey = file ? `${file.name}-${file.size}-${file.lastModified}` : '';

  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [previewFileName, setPreviewFileName] = useState(null);
  const [pdfNumPages, setPdfNumPages] = useState(null);
  const [pdfPageNumber, setPdfPageNumber] = useState(1);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [pdfZoomScale, setPdfZoomScale] = useState(1);

  useEffect(() => {
    if (!file || !(file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf'))) {
      setPdfBlobUrl(null);
      setPreviewFileName(null);
      setPdfNumPages(null);
      setPdfPageNumber(1);
      setPdfLoadError(false);
      setPdfZoomScale(1);
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPdfBlobUrl(url);
    setPreviewFileName(file.name);
    setPdfNumPages(null);
    setPdfPageNumber(1);
    setPdfLoadError(false);
    setPdfZoomScale(1);

    return () => {
      URL.revokeObjectURL(url);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fileKey encodes file identity for this slot
  }, [fileKey, sectionId]);

  const pdfZoomPercent = Math.round(pdfZoomScale * 100);
  const pdfBaseWidth = Math.min(typeof window !== 'undefined' ? window.innerWidth * 0.92 : 600, 720);
  const pdfPageWidth = pdfBaseWidth * pdfZoomScale;

  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  }), []);

  const onLoadSuccess = useCallback(({ numPages }) => {
    setPdfNumPages(numPages);
    setPdfLoadError(false);
  }, []);

  const onLoadError = useCallback(() => {
    setPdfLoadError(true);
  }, []);

  const goPrev = useCallback(() => {
    setPdfPageNumber((prev) => {
      const max = pdfNumPages || 1;
      return Math.max(1, Math.min(max, prev - 1));
    });
  }, [pdfNumPages]);

  const goNext = useCallback(() => {
    setPdfPageNumber((prev) => {
      const max = pdfNumPages || 1;
      return Math.max(1, Math.min(max, prev + 1));
    });
  }, [pdfNumPages]);

  const zoomIn = useCallback(() => {
    setPdfZoomScale((s) => clampZoom(s + PDF_ZOOM_STEP));
  }, []);
  const zoomOut = useCallback(() => {
    setPdfZoomScale((s) => clampZoom(s - PDF_ZOOM_STEP));
  }, []);
  const resetZoom = useCallback(() => setPdfZoomScale(1), []);

  const onZoomSlider = useCallback((e) => {
    const v = parseInt(e.target.value, 10);
    if (!Number.isNaN(v)) setPdfZoomScale(clampZoom(v / 100));
  }, []);

  if (!pdfBlobUrl) {
    return null;
  }

  if (pdfLoadError) {
    return (
      <div className="mt-4 text-center py-5 border border-info-600 rounded" style={{ height: '50vh' }}>
        <div className="d-flex flex-column align-items-center justify-content-center h-100 px-16">
          <h5 className="text-dark mb-16">{previewFileName || 'PDF'}</h5>
          <p className="text-grey-600 mb-24">
            Unable to load this PDF in the browser. You can open it in a new tab if your browser allows.
          </p>
          <a
            href={pdfBlobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary rounded-pill"
          >
            Open in new tab
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-grey-600 small mb-12">
        Preview
        {previewFileName ? (
          <>
            :
            {' '}
            <span className="text-dark fw-500">{previewFileName}</span>
          </>
        ) : null}
      </p>
      <div
        className="d-flex flex-column border border-info-600 rounded overflow-hidden"
        style={{ height: '65vh', width: '100%' }}
      >
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
                onClick={zoomOut}
                disabled={pdfZoomScale <= PDF_ZOOM_MIN}
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
                min={PDF_ZOOM_MIN_PERCENT}
                max={PDF_ZOOM_MAX_PERCENT}
                step={5}
                value={pdfZoomPercent}
                onChange={onZoomSlider}
                aria-label="Zoom level"
              />
              <span className="text-light small text-nowrap user-select-none" style={{ minWidth: '2.75rem' }}>
                {pdfZoomPercent}
                %
              </span>
              <Button
                variant="outline-light"
                size="sm"
                onClick={zoomIn}
                disabled={pdfZoomScale >= PDF_ZOOM_MAX}
                title="Zoom in"
                aria-label="Zoom in"
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
              <Button
                variant="outline-light"
                size="sm"
                className="text-nowrap mx-4"
                onClick={resetZoom}
                disabled={pdfZoomScale === 1}
                title="Reset zoom to 100%"
                aria-label="Reset zoom to 100%"
              >
                Reset
              </Button>
            </div>
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
              file={pdfBlobUrl}
              onLoadSuccess={onLoadSuccess}
              onLoadError={onLoadError}
              loading={(
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
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
                onClick={goPrev}
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
                onClick={goNext}
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
    </div>
  );
}
