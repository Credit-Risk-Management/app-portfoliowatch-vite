import { onboardingApi, setOnboardingOrgDb } from '@src/api/onboarding.api';
import {
  $onboardingRunDetail,
  $onboardingRuns,
  $onboardingTenants,
  $onboardingView,
  $onboardingMatchForm,
  $onboardingSelectedTenant,
  $onboardingTenantPick,
  $onboardingFiles,
  $onboardingFileDrafts,
  $onboardingFileView,
  $onboardingDiff,
  $onboardingRunSummary,
  ONBOARDING_ORG_DB_STORAGE_KEY,
  ONBOARDING_SUMMARY_POLL_MS,
} from './onboarding.consts';

const mergeTenantIntoList = (orgDb, displayName) => {
  const normalized = (orgDb || '').trim();
  if (!normalized) return;
  const list = $onboardingTenants.value || [];
  if (list.some(t => t.orgDb === normalized)) return;
  $onboardingTenants.value = [
    ...list,
    { orgDb: normalized, displayName: displayName || normalized, isActive: true },
  ];
};

export const fetchTenants = async () => {
  const res = await onboardingApi.getTenants();
  $onboardingTenants.value = res?.data ?? (Array.isArray(res) ? res : []);
  restoreOnboardingTenantFromStorage();
};

export const applySelectedTenant = (tenant) => {
  if (!tenant?.orgDb) {
    $onboardingSelectedTenant.value = { orgDb: null, displayName: null };
    $onboardingTenantPick.update({ orgDb: '' });
    setOnboardingOrgDb(null);
    try {
      window.localStorage.removeItem(ONBOARDING_ORG_DB_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return;
  }

  $onboardingSelectedTenant.value = {
    orgDb: tenant.orgDb,
    displayName: tenant.displayName || tenant.orgDb,
  };
  $onboardingTenantPick.update({ orgDb: tenant.orgDb });
  setOnboardingOrgDb(tenant.orgDb);
  mergeTenantIntoList(tenant.orgDb, tenant.displayName);
  try {
    window.localStorage.setItem(ONBOARDING_ORG_DB_STORAGE_KEY, tenant.orgDb);
  } catch {
    /* ignore */
  }
};

export function restoreOnboardingTenantFromStorage() {
  let stored = '';
  try {
    stored = window.localStorage.getItem(ONBOARDING_ORG_DB_STORAGE_KEY) || '';
  } catch {
    stored = '';
  }
  if (!stored) return;

  const tenant = ($onboardingTenants.value || []).find(t => t.orgDb === stored);
  applySelectedTenant(
    tenant || { orgDb: stored, displayName: stored },
  );
}

export const fetchRuns = async () => {
  if (!$onboardingSelectedTenant.value.orgDb) {
    restoreOnboardingTenantFromStorage();
  }
  if (!$onboardingSelectedTenant.value.orgDb) {
    $onboardingRuns.update({ list: [] });
    $onboardingView.update({ isTableLoading: false });
    return;
  }
  $onboardingView.update({ isTableLoading: true });
  try {
    const res = await onboardingApi.getRuns();
    const list = res?.data ?? [];
    $onboardingRuns.update({ list });
  } finally {
    $onboardingView.update({ isTableLoading: false });
  }
};

export const loadOnboardingRunsPage = async () => {
  $onboardingView.update({ isTableLoading: true });
  try {
    await fetchTenants();
    if ($onboardingSelectedTenant.value.orgDb) {
      await fetchRuns();
      return;
    }
    $onboardingRuns.update({ list: [] });
  } catch (err) {
    $onboardingView.update({ isTableLoading: false });
    throw err;
  } finally {
    if (!$onboardingSelectedTenant.value.orgDb) {
      $onboardingView.update({ isTableLoading: false });
    }
  }
};

const asList = (payload) => {
  const value = payload?.data ?? payload ?? [];
  return Array.isArray(value) ? value : [];
};

const unwrapRunFiles = (payload) => {
  const value = payload?.data ?? payload ?? {};
  if (Array.isArray(value)) {
    return { files: value, documentTypes: [] };
  }
  return {
    files: Array.isArray(value.files) ? value.files : [],
    documentTypes: Array.isArray(value.documentTypes) ? value.documentTypes : [],
  };
};

export const applyOnboardingRunFiles = (payload, runId) => {
  const { files, documentTypes } = unwrapRunFiles(payload);
  const dirty = $onboardingFileView.value.dirtyFileIds || {};
  const drafts = $onboardingFileDrafts.value || {};
  const nextDrafts = {};
  const nextDirty = {};
  files.forEach((file) => {
    const saved = file.documentType || '';
    if (dirty[file.id]) {
      nextDrafts[file.id] = drafts[file.id] ?? saved;
      nextDirty[file.id] = true;
    } else {
      nextDrafts[file.id] = saved;
    }
  });
  $onboardingFiles.update({
    list: files,
    documentTypeOptions: documentTypes,
    loadedRunId: runId,
  });
  $onboardingFileDrafts.reset();
  $onboardingFileDrafts.update(nextDrafts);
  $onboardingFileView.update({
    dirtyFileIds: nextDirty,
    isTableLoading: false,
    hasLoaded: true,
  });
};

const isActiveOnboardingRun = (runId) => $onboardingDiff.value.activeRunId === runId;

export const fetchRunFiles = async (runId) => {
  const filesRes = await onboardingApi.getRunFiles(runId);
  if (!isActiveOnboardingRun(runId)) return;
  applyOnboardingRunFiles(filesRes, runId);
};

export const fetchRunDetail = async (runId, { silent = false } = {}) => {
  if (!$onboardingSelectedTenant.value.orgDb) {
    restoreOnboardingTenantFromStorage();
  }
  const showInitialLoading = !silent && !$onboardingRunDetail.value.run?.id;
  if (showInitialLoading) {
    $onboardingRunDetail.update({ isLoading: true });
    $onboardingFileView.update({ isTableLoading: true });
  }
  try {
    const [runRes, itemsRes, filesRes] = await Promise.all([
      onboardingApi.getRun(runId),
      onboardingApi.getRunItems(runId),
      onboardingApi.getRunFiles(runId),
    ]);
    const run = runRes?.data ?? runRes;
    if (run?.orgDb) {
      const tenant = ($onboardingTenants.value || []).find(t => t.orgDb === run.orgDb);
      applySelectedTenant(tenant || { orgDb: run.orgDb, displayName: run.orgDb });
    }
    if ($onboardingDiff.value.activeRunId !== runId) return;
    $onboardingRunDetail.update({
      run,
      items: itemsRes?.data ?? [],
      isLoading: false,
    });
    applyOnboardingRunFiles(filesRes, runId);
  } catch (err) {
    if (showInitialLoading) {
      $onboardingRunDetail.update({ isLoading: false });
      $onboardingFileView.update({ isTableLoading: false });
    }
    if (silent) throw err;
  }
};

export const loadOnboardingRunPage = async (runId) => {
  try {
    await fetchTenants();
    if (!runId) {
      $onboardingRunDetail.update({ isLoading: false });
      return;
    }
    await fetchRunDetail(runId);
    const summary = await fetchRunSummary(runId);
    if (summary?.pipelineActive) {
      startOnboardingSummaryPoll(runId);
    }
  } catch (err) {
    $onboardingRunDetail.update({ isLoading: false });
    $onboardingFileView.update({ isTableLoading: false, hasLoaded: true });
    throw err;
  }
};

export const loadMatchCandidates = async (itemId) => {
  const runId = $onboardingRunDetail.value.run?.id;
  const item = ($onboardingRunDetail.value.items || []).find((row) => row.id === itemId);
  const [candRes, folderRes] = await Promise.all([
    onboardingApi.getItemCandidates(itemId),
    runId ? onboardingApi.getRunFolders(runId) : Promise.resolve({ data: [] }),
  ]);
  $onboardingMatchForm.update({
    candidates: asList(candRes),
    folders: asList(folderRes),
    selectedFolderPath: item?.folderPath || '',
    selectedBorrowerName: null,
    borrowerId: null,
    loanId: null,
  });
};

let summaryPollIntervalId = null;

export const clearOnboardingSummaryPoll = () => {
  if (summaryPollIntervalId != null) {
    clearInterval(summaryPollIntervalId);
    summaryPollIntervalId = null;
  }
};

export const fetchRunSummary = async (runId) => {
  if (!runId) return null;
  $onboardingRunSummary.update({ isLoading: true });
  try {
    const res = await onboardingApi.getRunSummary(runId);
    const data = res?.data ?? res;
    $onboardingRunSummary.update({ data, isLoading: false });
    return data;
  } catch (err) {
    $onboardingRunSummary.update({ isLoading: false });
    throw err;
  }
};

export const startOnboardingSummaryPoll = (runId) => {
  clearOnboardingSummaryPoll();
  summaryPollIntervalId = setInterval(async () => {
    try {
      const summary = await fetchRunSummary(runId);
      if (!summary?.pipelineActive) {
        clearOnboardingSummaryPoll();
      }
    } catch {
      /* keep polling until timeout or manual refresh */
    }
  }, ONBOARDING_SUMMARY_POLL_MS);
};

export const syncTenantFromPickSignal = () => {
  const orgDb = ($onboardingTenantPick.value.orgDb || '').trim();
  if (!orgDb) return false;
  const tenant = ($onboardingTenants.value || []).find(t => t.orgDb === orgDb);
  applySelectedTenant(tenant || { orgDb, displayName: orgDb });
  return true;
};
