import apiClient from './client';

let selectedOrgDb = null;

export const setOnboardingOrgDb = (orgDb) => {
  selectedOrgDb = orgDb;
};

const withOrgDbHeader = (config = {}) => ({
  ...config,
  headers: {
    ...(config.headers || {}),
    ...(selectedOrgDb ? { 'X-Onboarding-Org-Db': selectedOrgDb } : {}),
  },
});

export const onboardingApi = {
  getTenants: () => apiClient.get('/onboarding/tenants'),

  getRuns: () => apiClient.get('/onboarding/runs', withOrgDbHeader()),

  getRun: (runId) => apiClient.get(`/onboarding/runs/${runId}`, withOrgDbHeader()),

  getRunItems: (runId) => apiClient.get(`/onboarding/runs/${runId}/items`, withOrgDbHeader()),

  createRun: (formData) => apiClient.post('/onboarding/runs', formData, withOrgDbHeader({
    headers: { 'Content-Type': 'multipart/form-data' },
  })),

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

  startDiff: (runId) => apiClient.post(`/onboarding/runs/${runId}/diff`, {}, withOrgDbHeader()),

  getItemCandidates: (itemId) => apiClient.get(`/onboarding/items/${itemId}/candidates`, withOrgDbHeader()),

  confirmItemMatch: (itemId, body) => apiClient.patch(`/onboarding/items/${itemId}/match`, body, withOrgDbHeader()),

  startImport: (runId) => apiClient.post(`/onboarding/runs/${runId}/import`, {}, withOrgDbHeader()),
};
