import axios from 'axios';
import { auth } from '@src/utils/firebase';
import { successAlert } from '@src/components/global/Alert/_helpers/alert.events';
import getPermanentGuarantorUploadLink from '@src/api/guarantorFinancialUploadLink.api';
import * as consts from './guarantorFinancials.consts';

export const fetchPermanentUploadLink = async (guarantorId) => {
  if (!guarantorId) return;
  try {
    const response = await getPermanentGuarantorUploadLink(guarantorId);
    const token = response?.status === 'success' ? (response?.data?.token ?? response?.data) : null;
    consts.$permanentUploadLink.update({ token: token ?? null });
  } catch (error) {
    consts.$permanentUploadLink.update({ token: null });
  }
};

export const exportFinancialsExcel = async (guarantorId) => {
  if (!guarantorId) return;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333';
  const user = auth.currentUser;
  let token = '';
  if (user) {
    token = await user.getIdToken();
  }
  const response = await axios.get(
    `${API_BASE_URL}/guarantors/${guarantorId}/financials/spreadsheet/excel`,
    {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (response?.data) {
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guarantor-pfs-spreadsheet-${guarantorId}-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    successAlert('Excel file exported successfully!');
  } else {
    throw new Error('Invalid response from server');
  }
};
