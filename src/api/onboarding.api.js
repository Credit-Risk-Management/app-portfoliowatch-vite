import apiClient from './client';
import {
  $onboardingSelectedTenant,
  $onboardingTenantPick,
  ONBOARDING_ORG_DB_STORAGE_KEY,
} from '@src/components/views/Onboarding/_helpers/onboarding.consts';

let selectedOrgDb = null;

export const setOnboardingOrgDb = (orgDb) => {
  selectedOrgDb = orgDb || null;
};

function resolveOrgDbForHeader() {
  const fromSignal = $onboardingSelectedTenant.value?.orgDb
    || $onboardingTenantPick.value?.orgDb
    || selectedOrgDb;
  if (fromSignal) return fromSignal;
  try {
    return window.localStorage.getItem(ONBOARDING_ORG_DB_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

const withOrgDbHeader = (config = {}) => {
  const orgDb = resolveOrgDbForHeader();
  const headers = { ...(config.headers || {}) };
  if (orgDb) {
    headers['X-Onboarding-Org-Db'] = orgDb;
  }
  return { ...config, headers };
};

export const onboardingApi = {
  getTenants: () => apiClient.get('/onboarding/tenants'),

  getRuns: () => apiClient.get('/onboarding/runs', withOrgDbHeader()),

  getRun: (runId) => apiClient.get(`/onboarding/runs/${runId}`, withOrgDbHeader()),

  getRunItems: (runId) => apiClient.get(`/onboarding/runs/${runId}/items`, withOrgDbHeader()),

  getRunFolders: (runId) => apiClient.get(`/onboarding/runs/${runId}/folders`, withOrgDbHeader()),

  createRun: (formData) => apiClient.post('/onboarding/runs', formData, withOrgDbHeader()),

  getSignedUploadUrls: (runId, relativePaths) => apiClient.post(
    `/onboarding/runs/${runId}/files/signed-urls`,
    { relativePaths },
    withOrgDbHeader(),
  ),

  confirmUploadedFiles: (runId, files) => apiClient.post(
    `/onboarding/runs/${runId}/files/confirm`,
    { files },
    withOrgDbHeader(),
  ),

  completeUpload: (runId) => apiClient.post(
    `/onboarding/runs/${runId}/files/complete`,
    {},
    withOrgDbHeader(),
  ),

  getRunSummary: (runId) => apiClient.get(`/onboarding/runs/${runId}/summary`, withOrgDbHeader()),

  startDiff: (runId) => apiClient.post(`/onboarding/runs/${runId}/diff`, {}, withOrgDbHeader()),

  getItemCandidates: (itemId) => apiClient.get(`/onboarding/items/${itemId}/candidates`, withOrgDbHeader()),

  confirmItemMatch: (itemId, body) => apiClient.patch(`/onboarding/items/${itemId}/match`, body, withOrgDbHeader()),

  getRunFiles: (runId) => apiClient.get(`/onboarding/runs/${runId}/files`, withOrgDbHeader()),

  updateFileDocumentType: (fileId, documentType) => apiClient.patch(
    `/onboarding/files/${fileId}`,
    { documentType },
    withOrgDbHeader(),
  ),

  startImport: (runId) => apiClient.post(`/onboarding/runs/${runId}/import`, {}, withOrgDbHeader()),

  startFileScan: (runId, fileIds) => apiClient.post(
    `/onboarding/runs/${runId}/scan`,
    fileIds?.length ? { fileIds } : {},
    withOrgDbHeader(),
  ),
};
