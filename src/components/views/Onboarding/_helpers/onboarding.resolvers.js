import { onboardingApi, setOnboardingOrgDb } from '@src/api/onboarding.api';
import {
  $onboardingRunDetail,
  $onboardingRuns,
  $onboardingTenants,
  $onboardingView,
  $onboardingMatchForm,
  $onboardingSelectedTenant,
  $onboardingTenantPick,
  ONBOARDING_ORG_DB_STORAGE_KEY,
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

const asList = (payload) => {
  const value = payload?.data ?? payload ?? [];
  return Array.isArray(value) ? value : [];
};

export const fetchRunDetail = async (runId, { silent = false } = {}) => {
  if (!$onboardingSelectedTenant.value.orgDb) {
    restoreOnboardingTenantFromStorage();
  }
  if (!silent) $onboardingRunDetail.update({ isLoading: true });
  try {
    const [runRes, itemsRes] = await Promise.all([
      onboardingApi.getRun(runId),
      onboardingApi.getRunItems(runId),
    ]);
    const run = runRes?.data ?? runRes;
    if (run?.orgDb) {
      const tenant = ($onboardingTenants.value || []).find(t => t.orgDb === run.orgDb);
      applySelectedTenant(tenant || { orgDb: run.orgDb, displayName: run.orgDb });
    }
    $onboardingRunDetail.update({
      run,
      items: itemsRes?.data ?? [],
      isLoading: false,
    });
  } catch (err) {
    if (!silent) $onboardingRunDetail.update({ isLoading: false });
    if (silent) throw err;
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

export const syncTenantFromPickSignal = () => {
  const orgDb = ($onboardingTenantPick.value.orgDb || '').trim();
  if (!orgDb) return false;
  const tenant = ($onboardingTenants.value || []).find(t => t.orgDb === orgDb);
  applySelectedTenant(tenant || { orgDb, displayName: orgDb });
  return true;
};
