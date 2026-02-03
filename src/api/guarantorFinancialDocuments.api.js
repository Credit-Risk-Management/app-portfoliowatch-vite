import { storage } from '@src/utils/firebase';
import apiClient from './client';

const guarantorFinancialDocumentsApi = {

  uploadFile: async ({ guarantorFinancialId, file, documentType, uploadedBy }) => {
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `financials/${guarantorFinancialId}/${timestamp}-${sanitizedFileName}`;

    const storageRef = storage.ref(storagePath);
    const uploadTask = await storageRef.put(file, { contentType: file.type });
    const storageUrl = await uploadTask.ref.getDownloadURL();

    const response = await apiClient.post('/guarantor-financial-documents', {
      guarantorFinancialId,
      documentType,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      storagePath,
      storageUrl,
      status: 'UPLOADED',
      uploadedBy,
    });

    return response.data;
  },

  getByGuarantorFinancial: async (guarantorFinancialId) => {
    const response = await apiClient.get(
      `/guarantor-financial-documents/${guarantorFinancialId}`,
    );
    return response;
  },

  getByGuarantor: async (guarantorId) => {
    const response = await apiClient.get(
      `/guarantor-financial-documents/guarantor/${guarantorId}`,
    );
    return response;
  },
};

export default guarantorFinancialDocumentsApi;
