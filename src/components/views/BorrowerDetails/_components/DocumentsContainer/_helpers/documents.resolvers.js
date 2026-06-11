import { $documentsContainerView } from './documents.consts';

export const createPdfBlobUrl = (currentDoc) => {
  // Clean up existing blob URL if any
  const existingBlobUrl = $documentsContainerView.value.pdfBlobUrl;
  if (existingBlobUrl) {
    URL.revokeObjectURL(existingBlobUrl);
  }

  // For newly uploaded files with File object, create a blob URL
  if (currentDoc?.file) {
    const blobUrl = URL.createObjectURL(currentDoc.file);
    $documentsContainerView.update({ pdfBlobUrl: blobUrl, pdfLoadError: false });
    return blobUrl;
  }

  // For stored documents, we'll use storageUrl directly (no blob URL needed)
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
