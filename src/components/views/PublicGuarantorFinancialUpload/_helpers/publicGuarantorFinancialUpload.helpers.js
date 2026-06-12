import { validatePfsWorksheetForSubmit } from '../_components/PfsWorksheetModal/_helpers/pfsWorksheetModal.helpers';
import { $pfsWorksheetForm } from '../_components/PfsWorksheetModal/_helpers/pfsWorksheetModal.consts';
import { GUARANTOR_DOC_SECTION, UPLOADER_BY_DOC_KEY } from './publicGuarantorFinancialUpload.consts';

/**
 * Document types that must be uploaded on this submit (API may omit after package complete).
 * @param {object} linkData
 * @returns {string[]}
 */
export function getBlockingDocumentKeysForGuarantorLink(linkData) {
  const fromApi = linkData?.requiredForSubmitDocumentKeys;
  if (Array.isArray(fromApi)) return fromApi;
  const reqs = linkData?.documentRequirements;
  if (Array.isArray(reqs)) {
    return reqs
      .filter((r) => r?.requiredForSubmit && r?.status === 'PENDING')
      .map((r) => r.type);
  }
  return Array.isArray(linkData?.requiredDocumentKeys) ? linkData.requiredDocumentKeys : [];
}

/**
 * @param {object} linkData - API `data` from GET public token
 * @returns {{ sectionId: string, title: string, helperText: string, inputId: string, apiDocumentKey: string, requiredForSubmit: boolean, requirementStatus: string }[]}
 */
export function getRequiredPdfSectionsForGuarantorLink(linkData) {
  const reqs = linkData?.documentRequirements;
  if (Array.isArray(reqs) && reqs.length > 0) {
    return reqs
      .filter((r) => r?.visible && r?.status !== 'WAIVED')
      .map((r) => {
        const def = GUARANTOR_DOC_SECTION[r.type];
        if (!def) return null;
        return {
          ...def,
          apiDocumentKey: r.type,
          requiredForSubmit: Boolean(r.requiredForSubmit && r.status === 'PENDING'),
          requirementStatus: r.status,
        };
      })
      .filter(Boolean);
  }

  const keys = Array.isArray(linkData?.requiredDocumentKeys) ? linkData.requiredDocumentKeys : [];
  return keys
    .map((k) => {
      const def = GUARANTOR_DOC_SECTION[k];
      if (!def) return null;
      return {
        ...def,
        apiDocumentKey: k,
        requiredForSubmit: true,
        requirementStatus: 'PENDING',
      };
    })
    .filter(Boolean);
}

/** Status column / badge from API requirement row. */
export function getRequirementPolicyLabel(section) {
  if (section?.requirementStatus === 'COMPLETED') return 'Received';
  if (section?.requirementStatus === 'WAIVED') return 'Not required';
  if (section?.requirementStatus === 'EXTENDED') return 'Extended';
  if (section?.requiredForSubmit) return 'Required to submit';
  return 'Requested when available';
}

export function canSubmitGuarantorLink(linkData, requiredPdfSections) {
  const blockingKeys = getBlockingDocumentKeysForGuarantorLink(linkData);
  const blockingOk = blockingKeys.length === 0
    || blockingKeys.every((key) => isGuarantorSectionReadyForSubmit(key));
  const hasAnyStaged = requiredPdfSections.some(
    (s) => hasGuarantorPdfStagedForKey(s.apiDocumentKey),
  );
  return blockingOk && hasAnyStaged;
}

export function getGuarantorUploaderForDocKey(docKey) {
  return UPLOADER_BY_DOC_KEY[docKey] ?? null;
}

export function isGuarantorPfsWorksheetReady() {
  return validatePfsWorksheetForSubmit($pfsWorksheetForm.value || {}).valid;
}

export function isGuarantorSectionReadyForSubmit(apiDocumentKey) {
  if (apiDocumentKey === 'personalFinancialStatement') {
    return isGuarantorPfsWorksheetReady();
  }
  return hasGuarantorPdfStagedForKey(apiDocumentKey);
}

export function hasGuarantorPdfStagedForKey(docKey) {
  if (docKey === 'personalFinancialStatement') {
    return isGuarantorPfsWorksheetReady();
  }
  const uploader = getGuarantorUploaderForDocKey(docKey);
  if (!uploader) return false;
  return (uploader.value?.financialDocs ?? []).length > 0;
}
