import { $documentsContainerView } from './guarantorFinancialsDocumentsContainer.consts';

export const createPdfBlobUrl = (currentDoc) => {
  const existingBlobUrl = $documentsContainerView.value.pdfBlobUrl;
  if (existingBlobUrl) {
    URL.revokeObjectURL(existingBlobUrl);
  }

  if (currentDoc?.file) {
    const blobUrl = URL.createObjectURL(currentDoc.file);
    $documentsContainerView.update({ pdfBlobUrl: blobUrl, pdfLoadError: false });
    return blobUrl;
  }

  $documentsContainerView.update({ pdfBlobUrl: null, pdfLoadError: false });
  return null;
};

export const resetPdfState = () => {
  $documentsContainerView.update({
    pdfLoadError: false,
    pdfPageNumber: 1,
    pdfNumPages: null,
    pdfZoomScale: 1,
  });
};

export const handlePdfLoadSuccess = (numPages) => {
  $documentsContainerView.update({
    pdfNumPages: numPages,
    pdfLoadError: false,
  });
};

export const handlePdfLoadError = () => {
  $documentsContainerView.update({ pdfLoadError: true });
};
