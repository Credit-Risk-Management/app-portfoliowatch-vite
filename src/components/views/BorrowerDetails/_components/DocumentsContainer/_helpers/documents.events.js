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
