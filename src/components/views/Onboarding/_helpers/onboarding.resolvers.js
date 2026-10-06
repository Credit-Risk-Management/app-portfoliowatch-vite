import { onboardingApi, setOnboardingOrgDb } from '@src/api/onboarding.api';
import {
  $onboardingRunDetail,
  $onboardingRuns,
  $onboardingTenants,
  $onboardingView,
  $onboardingMatchForm,
  $onboardingSelectedTenant,
} from './onboarding.consts';

export const fetchTenants = async () => {
  const res = await onboardingApi.getTenants();
  $onboardingTenants.value = res?.data ?? (Array.isArray(res) ? res : []);
};

export const applySelectedTenant = (tenant) => {
  $onboardingSelectedTenant.value = tenant;
  setOnboardingOrgDb(tenant?.orgDb || null);
};

export const fetchRuns = async () => {
  $onboardingView.update({ isTableLoading: true });
  try {
    const res = await onboardingApi.getRuns();
    const list = res?.data ?? [];
    $onboardingRuns.update({ list });
  } finally {
    $onboardingView.update({ isTableLoading: false });
  }
};

export const fetchRunDetail = async (runId) => {
  $onboardingRunDetail.update({ isLoading: true });
  try {
    const [runRes, itemsRes] = await Promise.all([
      onboardingApi.getRun(runId),
      onboardingApi.getRunItems(runId),
    ]);
    const run = runRes?.data ?? runRes;
    if (run?.orgDb) {
      applySelectedTenant({ orgDb: run.orgDb, displayName: run.orgDb });
    }
    $onboardingRunDetail.update({
      run,
      items: itemsRes?.data ?? [],
      isLoading: false,
    });
  } catch {
    $onboardingRunDetail.update({ isLoading: false });
  }
};

export const loadMatchCandidates = async (itemId) => {
  const res = await onboardingApi.getItemCandidates(itemId);
  $onboardingMatchForm.update({
    candidates: res?.data || res || [],
    borrowerId: null,
    loanId: null,
  });
};
