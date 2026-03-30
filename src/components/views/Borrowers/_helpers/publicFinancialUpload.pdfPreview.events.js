import { $publicFinancialPdfPreview } from './publicFinancialUpload.consts';

export const setPdfPageNumber = (pageNumber) => {
  const view = $publicFinancialPdfPreview.value;
  const maxPages = view.pdfNumPages || 1;
  const newPageNumber = Math.max(1, Math.min(maxPages, pageNumber));
  $publicFinancialPdfPreview.update({ pdfPageNumber: newPageNumber });
};

export const goToPreviousPage = () => {
  setPdfPageNumber($publicFinancialPdfPreview.value.pdfPageNumber - 1);
};

export const goToNextPage = () => {
  setPdfPageNumber($publicFinancialPdfPreview.value.pdfPageNumber + 1);
};

export const PDF_ZOOM_MIN = 0.5;
export const PDF_ZOOM_MAX = 3;
const PDF_ZOOM_STEP = 0.25;

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
  $publicFinancialPdfPreview.update({ pdfZoomScale: scale });
};

export const handlePdfZoomSliderChange = (e) => {
  const v = parseInt(e.target.value, 10);
  if (!Number.isNaN(v)) setPdfZoomFromPercent(v);
};

export const zoomPdfIn = () => {
  const { pdfZoomScale = 1 } = $publicFinancialPdfPreview.value;
  const next = Math.min(
    PDF_ZOOM_MAX,
    Math.round((pdfZoomScale + PDF_ZOOM_STEP) * 100) / 100,
  );
  $publicFinancialPdfPreview.update({ pdfZoomScale: next });
};

export const zoomPdfOut = () => {
  const { pdfZoomScale = 1 } = $publicFinancialPdfPreview.value;
  const next = Math.max(
    PDF_ZOOM_MIN,
    Math.round((pdfZoomScale - PDF_ZOOM_STEP) * 100) / 100,
  );
  $publicFinancialPdfPreview.update({ pdfZoomScale: next });
};

export const resetPdfZoom = () => {
  $publicFinancialPdfPreview.update({ pdfZoomScale: 1 });
};
