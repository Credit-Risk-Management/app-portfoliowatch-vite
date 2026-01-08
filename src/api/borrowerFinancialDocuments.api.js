import { storage } from '@src/utils/firebase';
import apiClient from './client';

const borrowerFinancialDocumentsApi = {
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
      return response; // Return the whole response, not response.data
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
