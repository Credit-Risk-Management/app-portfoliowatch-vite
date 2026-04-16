import { $borrowerFinancialsForm } from '@src/signals';
import { $documentsContainerView } from './documents.consts';

export const handleDocumentTypeChange = (e, documentsByType, $modalState) => {
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

export const handleDocumentSelectChange = (e, handleSwitchDocument, $modalState) => {
  const newIndex = parseInt(e.target.value, 10);
  if (!Number.isNaN(newIndex)) {
    handleSwitchDocument($modalState, newIndex);
  }
};

export const handleRemove = (currentDoc, handleRemoveDocument, $modalState) => {
  if (currentDoc) {
    handleRemoveDocument($modalState, currentDoc.id);
  }
};

export const handleAddFileClick = (fileInputRef) => {
  fileInputRef.current?.click();
};

export const handleFileInputChange = (e, $financialDocsUploader, handleFileUpload) => {
  const files = Array.from(e.target.files || []);
  if (files.length > 0) {
    $financialDocsUploader.update({ financialDocs: files });
    handleFileUpload();
    // Reset the input so the same file can be selected again
    e.target.value = '';
  }
};

export const setPdfPageNumber = (pageNumber) => {
  const view = $documentsContainerView.value;
  const maxPages = view.pdfNumPages || 1;
  const newPageNumber = Math.max(1, Math.min(maxPages, pageNumber));
  $documentsContainerView.update({ pdfPageNumber: newPageNumber });
};

export const goToPreviousPage = () => {
  const currentPage = $documentsContainerView.value.pdfPageNumber;
  setPdfPageNumber(currentPage - 1);
};

export const goToNextPage = () => {
  const currentPage = $documentsContainerView.value.pdfPageNumber;
  setPdfPageNumber(currentPage + 1);
};

export const PDF_ZOOM_MIN = 0.5;
export const PDF_ZOOM_MAX = 3;
const PDF_ZOOM_STEP = 0.25;

/** Slider / UI use whole percent (50–300). */
export const PDF_ZOOM_MIN_PERCENT = Math.round(PDF_ZOOM_MIN * 100);
export const PDF_ZOOM_MAX_PERCENT = Math.round(PDF_ZOOM_MAX * 100);

const clampZoomScale = (scale) => Math.max(
  PDF_ZOOM_MIN,
  Math.min(PDF_ZOOM_MAX, Math.round(scale * 100) / 100),
);

export const setPdfZoomFromPercent = (percent) => {
  const n = typeof percent === 'number' ? percent : parseInt(String(percent), 10);
  if (Number.isNaN(n)) return;
  const scale = clampZoomScale(n / 100);
  $documentsContainerView.update({ pdfZoomScale: scale });
};

export const handlePdfZoomSliderChange = (e) => {
  const v = parseInt(e.target.value, 10);
  if (!Number.isNaN(v)) setPdfZoomFromPercent(v);
};

export const zoomPdfIn = () => {
  const { pdfZoomScale = 1 } = $documentsContainerView.value;
  const next = Math.min(
    PDF_ZOOM_MAX,
    Math.round((pdfZoomScale + PDF_ZOOM_STEP) * 100) / 100,
  );
  $documentsContainerView.update({ pdfZoomScale: next });
};

export const zoomPdfOut = () => {
  const { pdfZoomScale = 1 } = $documentsContainerView.value;
  const next = Math.max(
    PDF_ZOOM_MIN,
    Math.round((pdfZoomScale - PDF_ZOOM_STEP) * 100) / 100,
  );
  $documentsContainerView.update({ pdfZoomScale: next });
};

export const resetPdfZoom = () => {
  $documentsContainerView.update({ pdfZoomScale: 1 });
};

const toNumberFromFormValue = (value) => {
  if (value == null || value === '') return null;
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : Number(value);
  return Number.isNaN(num) ? null : num;
};

/** Sets profit margin to (netIncome / grossRevenue) × 100, matching submit-time logic. */
export const handleRecalculateProfitMargin = () => {
  const { grossRevenue, netIncome } = $borrowerFinancialsForm.value;
  const gr = toNumberFromFormValue(grossRevenue);
  const ni = toNumberFromFormValue(netIncome);
  if (gr == null || gr <= 0 || ni == null) return;
  const pct = parseFloat(((ni / gr) * 100).toFixed(4));
  $borrowerFinancialsForm.update({ profitMargin: String(pct) });
};
