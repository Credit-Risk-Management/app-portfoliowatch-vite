import apiClient from './client';
import { storage } from '@src/utils/firebase';

const borrowerFinancialDocumentsApi = {
  /**
   * Initiate file upload - get signed URL
   * @param {Object} data - Upload initiation data
   * @returns {Promise<Object>} Upload URL and document ID
   */
  initiateUpload: async (data) => {
    try {
      const response = await apiClient.post('/borrower-financial-documents/upload/initiate', data);
      return response.data;
    } catch (error) {
      console.error('Error initiating document upload:', error);
      throw error;
    }
  },

  /**
   * Upload file directly to storage using signed URL
   * @param {string} uploadUrl - Signed upload URL
   * @param {File} file - File to upload
   * @param {string} contentType - File content type
   * @returns {Promise<string>} Storage URL
   */
  uploadToStorage: async (uploadUrl, file, contentType) => {
    try {
      // Upload directly to storage (Firebase/S3) using fetch
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      // Extract storage URL from upload URL (remove query parameters)
      const storageUrl = uploadUrl.split('?')[0];
      return storageUrl;
    } catch (error) {
      console.error('Error uploading file to storage:', error);
      throw error;
    }
  },

  /**
   * Confirm upload completion
   * @param {string} documentId - Document ID
   * @param {string} storageUrl - Storage URL
   * @returns {Promise<Object>} Updated document
   */
  confirmUpload: async (documentId, storageUrl) => {
    try {
      const response = await apiClient.post('/borrower-financial-documents/upload/confirm', {
        documentId,
        storageUrl,
      });
      return response.data;
    } catch (error) {
      console.error('Error confirming document upload:', error);
      throw error;
    }
  },

  /**
   * Mark upload as failed
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Updated document
   */
  markUploadFailed: async (documentId) => {
    try {
      const response = await apiClient.post('/borrower-financial-documents/upload/failed', {
        documentId,
      });
      return response.data;
    } catch (error) {
      console.error('Error marking upload as failed:', error);
      throw error;
    }
  },

  /**
   * Complete file upload process (upload to Firebase + save metadata)
   * @param {Object} params - Upload parameters
   * @param {string} params.borrowerFinancialId - Borrower financial ID
   * @param {File} params.file - File to upload
   * @param {string} params.documentType - Document type
   * @param {string} params.uploadedBy - User email/name
   * @returns {Promise<Object>} Uploaded document
   */
  uploadFile: async ({ borrowerFinancialId, file, documentType, uploadedBy }) => {
    try {
      // Create unique file path
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `borrower-financials/${borrowerFinancialId}/${timestamp}-${sanitizedFileName}`;

      // Upload directly to Firebase Storage using SDK (bypasses CORS!)
      const storageRef = storage.ref(storagePath);
      const uploadTask = await storageRef.put(file, {
        contentType: file.type,
      });

      // Get the download URL
      const downloadURL = await uploadTask.ref.getDownloadURL();

      // Create document record in backend
      const response = await apiClient.post('/borrower-financial-documents', {
        borrowerFinancialId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storagePath,
        storageUrl: downloadURL,
        documentType,
        uploadedBy,
        status: 'UPLOADED',
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  /**
   * Get documents by borrower financial ID
   * @param {string} borrowerFinancialId - Borrower financial ID
   * @returns {Promise<Object>} Documents
   */
  getByBorrowerFinancial: async (borrowerFinancialId) => {
    try {
      // apiClient already unwraps response.data via interceptor
      // So response is already { success: true, data: [...], count: ... }
      const response = await apiClient.get(`/borrower-financial-documents/borrower-financial/${borrowerFinancialId}`);
      return response;  // Return the whole response, not response.data
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  /**
   * Get document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object>} Document
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/borrower-financial-documents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  /**
   * Get download URL for a document
   * @param {string} id - Document ID
   * @param {number} expiresIn - Expiration time in seconds
   * @returns {Promise<Object>} Download URL
   */
  getDownloadUrl: async (id, expiresIn = 3600) => {
    try {
      const response = await apiClient.get(`/borrower-financial-documents/${id}/download?expiresIn=${expiresIn}`);
      return response.data;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  },

  /**
   * Delete document
   * @param {string} id - Document ID
   * @returns {Promise<Object>} Success response
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/borrower-financial-documents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },
};

export default borrowerFinancialDocumentsApi;

