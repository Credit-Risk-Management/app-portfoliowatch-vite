import documentsApi from '@src/api/documents.api';
import { dangerAlert, successAlert } from '@src/components/global/Alert/_helpers/alert.events';

/**
 * Upload a file directly to Firebase Storage using a signed URL
 * @param {File} file - The file to upload
 * @param {string} signedUrl - The signed upload URL from the backend
 * @returns {Promise<void>}
 */
export const uploadToFirebase = async (file, signedUrl) => {
  try {
    console.log('Uploading to Firebase Storage...');
    console.log('Signed URL:', signedUrl);
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    
    const response = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    console.log('Upload response status:', response.status);
    console.log('Upload response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', errorText);
      throw new Error(`Upload failed with status: ${response.status} - ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    throw error;
  }
};

/**
 * Orchestrate the full upload flow for a single file
 * 1. Initiate upload (get signed URL from backend)
 * 2. Upload file directly to Firebase Storage
 * 3. Confirm upload with backend
 * @param {string} loanId - The loan ID
 * @param {File} file - The file to upload
 * @param {string} userId - The user ID
 * @returns {Promise<object>} - The uploaded document data
 */
export const initiateAndUploadFile = async (loanId, file, userId) => {
  let documentId = null;

  try {
    // Step 1: Initiate upload and get signed URL
    const initiateResponse = await documentsApi.initiateUpload({
      loanId,
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
      uploadedBy: userId,
      documentType: 'FINANCIAL',
    });

    if (!initiateResponse.success) {
      throw new Error(initiateResponse.error || 'Failed to initiate upload');
    }

    const { documentId: docId, uploadUrl, storagePath } = initiateResponse.data;
    documentId = docId;

    // Step 2: Upload file directly to Firebase Storage
    await uploadToFirebase(file, uploadUrl);

    // Step 3: Confirm upload with backend
    const confirmResponse = await documentsApi.confirmUpload(documentId, storagePath);

    if (!confirmResponse.success) {
      throw new Error(confirmResponse.error || 'Failed to confirm upload');
    }

    return confirmResponse.data;
  } catch (error) {
    console.error('Error in upload flow:', error);

    // If we created a document record, mark it as failed
    if (documentId) {
      try {
        await documentsApi.markUploadFailed(documentId, error.message);
      } catch (markFailedError) {
        console.error('Error marking upload as failed:', markFailedError);
      }
    }

    throw error;
  }
};

/**
 * Upload multiple files sequentially
 * @param {string} loanId - The loan ID
 * @param {File[]} files - Array of files to upload
 * @param {string} userId - The user ID
 * @returns {Promise<object>} - Upload results with success/failure counts
 */
export const uploadMultipleFiles = async (loanId, files, userId) => {
  const results = {
    successful: [],
    failed: [],
    total: files.length,
  };

  for (const file of files) {
    try {
      const document = await initiateAndUploadFile(loanId, file, userId);
      results.successful.push({
        fileName: file.name,
        document,
      });
      successAlert(`Uploaded: ${file.name}`);
    } catch (error) {
      results.failed.push({
        fileName: file.name,
        error: error.message,
      });
      dangerAlert(`Failed to upload ${file.name}: ${error.message}`);
    }
  }

  // Summary alert
  if (results.failed.length === 0) {
    successAlert(`Successfully uploaded all ${results.total} file(s)`);
  } else if (results.successful.length === 0) {
    dangerAlert(`Failed to upload all ${results.total} file(s)`);
  } else {
    dangerAlert(
      `Uploaded ${results.successful.length} of ${results.total} file(s). ${results.failed.length} failed.`
    );
  }

  return results;
};

