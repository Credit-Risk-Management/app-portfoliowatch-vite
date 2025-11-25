import { $documentsView, $documentsFilter } from '@src/signals';
import documentsApi from '@src/api/documents.api';
import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import * as resolvers from './documents.resolvers';

export const handleDeleteDocument = async (documentId) => {
  try {
    await documentsApi.delete(documentId);

    $documentsView.update({ showDeleteModal: false });
    successAlert('Document deleted successfully');

    await resolvers.fetchAndSetDocumentData();
  } catch (error) {
    dangerAlert(error.message || 'Failed to delete document');
  } finally {
    $documentsView.update({ isTableLoading: false });
  }
};

export const handleDownloadDocument = async (documentId, fileName) => {
  try {
    const response = await documentsApi.getDownloadUrl(documentId);
    
    if (response.data && response.data.downloadUrl) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = fileName || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      successAlert('Download started');
    } else {
      dangerAlert('Failed to get download URL');
    }
  } catch (error) {
    dangerAlert(error.message || 'Failed to download document');
  }
};

export const handleDocumentFilterChange = async () => {
  try {
    const filters = {
      searchTerm: $documentsFilter.value.searchTerm,
      documentType: $documentsFilter.value.documentType,
    };

    await resolvers.fetchAndSetDocumentData(filters, false);
  } catch (error) {
    dangerAlert(error.message || 'Failed to filter documents');
  } finally {
    $documentsView.update({ isTableLoading: false });
  }
};

