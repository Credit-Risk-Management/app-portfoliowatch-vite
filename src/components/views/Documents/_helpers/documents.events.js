import documentsApi from '@src/api/documents.api';
import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';

export const handleDownloadDocument = async (documentId, fileName) => {
  try {
    const response = await documentsApi.getDownloadUrl(documentId);

    if (response.data && response.data.downloadUrl) {
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

export default handleDownloadDocument;
