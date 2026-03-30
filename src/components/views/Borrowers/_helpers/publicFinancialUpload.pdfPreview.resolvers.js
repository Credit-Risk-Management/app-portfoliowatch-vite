import {
  $publicFinancialPdfPreview,
  $publicIncomeStatementUploader,
  $publicBalanceSheetUploader,
  $publicFinancialAccordionExpanded,
} from './publicFinancialUpload.consts';

const UPLOADER_BY_SECTION = {
  incomeStatement: $publicIncomeStatementUploader,
  balanceSheet: $publicBalanceSheetUploader,
};

const revokeIfNeeded = () => {
  const { pdfBlobUrl } = $publicFinancialPdfPreview.value;
  if (pdfBlobUrl) {
    URL.revokeObjectURL(pdfBlobUrl);
  }
};

/**
 * Clear preview state and revoke blob URL (call after uploads clear or when leaving step).
 */
export const resetPublicFinancialPdfPreview = () => {
  revokeIfNeeded();
  $publicFinancialPdfPreview.update({
    pdfBlobUrl: null,
    pdfNumPages: null,
    pdfPageNumber: 1,
    pdfLoadError: false,
    pdfZoomScale: 1,
    previewFileName: null,
  });
};

/**
 * Point preview at the PDF for the currently expanded accordion section (if any file is staged).
 */
export const syncPublicFinancialPdfPreview = () => {
  const expandedId = $publicFinancialAccordionExpanded.value;
  const uploader = UPLOADER_BY_SECTION[expandedId];
  const files = uploader?.value?.financialDocs || [];
  const file = files[0];

  revokeIfNeeded();

  if (!file || !(file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf'))) {
    $publicFinancialPdfPreview.update({
      pdfBlobUrl: null,
      pdfNumPages: null,
      pdfPageNumber: 1,
      pdfLoadError: false,
      pdfZoomScale: 1,
      previewFileName: null,
    });
    return;
  }

  const blobUrl = URL.createObjectURL(file);
  $publicFinancialPdfPreview.update({
    pdfBlobUrl: blobUrl,
    pdfNumPages: null,
    pdfPageNumber: 1,
    pdfLoadError: false,
    pdfZoomScale: 1,
    previewFileName: file.name,
  });
};

export const handlePdfLoadSuccess = (numPages) => {
  $publicFinancialPdfPreview.update({
    pdfNumPages: numPages,
    pdfLoadError: false,
  });
};

export const handlePdfLoadError = () => {
  $publicFinancialPdfPreview.update({ pdfLoadError: true });
};
