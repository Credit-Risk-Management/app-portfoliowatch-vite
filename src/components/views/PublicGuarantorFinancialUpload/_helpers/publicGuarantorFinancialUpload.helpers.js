import { GUARANTOR_DOC_SECTION, UPLOADER_BY_DOC_KEY } from './publicGuarantorFinancialUpload.consts';

/**
 * @param {object} linkData - API `data` from GET public token
 * @returns {{ sectionId: string, title: string, helperText: string, inputId: string, apiDocumentKey: string }[]}
 */
export function getRequiredPdfSectionsForGuarantorLink(linkData) {
  const keys = Array.isArray(linkData?.requiredDocumentKeys) ? linkData.requiredDocumentKeys : [];
  return keys
    .map((k) => {
      const def = GUARANTOR_DOC_SECTION[k];
      if (!def) return null;
      return { ...def, apiDocumentKey: k };
    })
    .filter(Boolean);
}

export function getGuarantorUploaderForDocKey(docKey) {
  return UPLOADER_BY_DOC_KEY[docKey] ?? null;
}

export function hasGuarantorPdfStagedForKey(docKey) {
  const uploader = getGuarantorUploaderForDocKey(docKey);
  if (!uploader) return false;
  return (uploader.value?.financialDocs ?? []).length > 0;
}
