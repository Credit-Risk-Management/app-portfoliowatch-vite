import * as consts from './guarantorFinancialsTab.consts';

/**
 * Build upload link URL from permanent link token (for copy button).
 */
const getGuarantorUploadLinkUrl = () => {
  const token = consts.$permanentUploadLink.value?.token;
  if (!token) return null;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/upload-pfs/${token}`;
};

export default getGuarantorUploadLinkUrl;
