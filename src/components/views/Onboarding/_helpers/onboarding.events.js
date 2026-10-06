import { onboardingApi } from '@src/api/onboarding.api';
import { handleNotification } from '@src/components/global/Alert/_helpers/alert.events';
import {
  $onboardingCreateForm,
  $onboardingUploadState,
  $onboardingView,
  $onboardingMatchForm,
  $onboardingTenantPick,
  $onboardingTenants,
  $onboardingSelectedTenant,
  $onboardingDiff,
  $onboardingRunDetail,
  ONBOARDING_DIFF_POLL_MS,
  ONBOARDING_DIFF_POLL_TIMEOUT_MS,
} from './onboarding.consts';
import {
  applySelectedTenant,
  fetchRunDetail,
  fetchRuns,
  loadMatchCandidates,
  syncTenantFromPickSignal,
} from './onboarding.resolvers';

const UPLOAD_CONCURRENCY = 5;

const notificationMessage = (err, fallback) => {
  if (typeof err === 'string' && err) return err;
  if (err?.message) return err.message;
  return fallback;
};

export const handleSelectTenant = (tenant) => {
  applySelectedTenant(tenant);
  fetchRuns();
};

export const openCreateModal = () => {
  $onboardingView.update({ showCreateModal: true });
};

export const closeCreateModal = () => {
  $onboardingView.update({ showCreateModal: false });
  $onboardingCreateForm.reset();
  const orgDb = $onboardingSelectedTenant.value?.orgDb;
  if (orgDb) {
    $onboardingTenantPick.update({ orgDb });
  } else {
    $onboardingTenantPick.reset();
  }
};

export const openUploadModal = (runId) => {
  $onboardingView.update({ showUploadModal: true, selectedRunId: runId });
  $onboardingUploadState.reset();
};

export const closeUploadModal = () => {
  $onboardingView.update({ showUploadModal: false });
};

export const openMatchModal = async (itemId) => {
  const item = ($onboardingRunDetail.value.items || []).find((row) => row.id === itemId);
  $onboardingMatchForm.update({
    candidates: [],
    folders: [],
    selectedFolderPath: item?.folderPath || '',
    selectedBorrowerName: null,
    borrowerId: null,
    loanId: null,
  });
  $onboardingView.update({ showMatchModal: true, selectedItemId: itemId });
  try {
    await loadMatchCandidates(itemId);
  } catch (err) {
    handleNotification({
      variant: 'danger',
      message: notificationMessage(err, 'Could not load match options.'),
    });
  }
};

export const closeMatchModal = () => {
  $onboardingView.update({ showMatchModal: false, selectedItemId: null });
};

export const handleCreateRun = async (navigate) => {
  if (!syncTenantFromPickSignal()) {
    handleNotification({
      variant: 'danger',
      message: 'Select a tenant before creating a run.',
    });
    return;
  }

  const form = $onboardingCreateForm.value;
  if (!form.name?.trim()) {
    handleNotification({
      variant: 'danger',
      message: 'Run name is required.',
    });
    return;
  }

  const fd = new FormData();
  fd.append('name', form.name.trim());
  if (form.dropboxFolderName) fd.append('dropboxFolderName', form.dropboxFolderName);
  if (form.masterListFile) fd.append('masterList', form.masterListFile);
  const res = await onboardingApi.createRun(fd);
  const run = res?.data ?? res;
  if (run?.orgDb) {
    const tenant = ($onboardingTenants.value || []).find(t => t.orgDb === run.orgDb);
    applySelectedTenant(tenant || { orgDb: run.orgDb, displayName: run.orgDb });
  }
  closeCreateModal();
  await fetchRuns();
  if (run?.id && typeof navigate === 'function') {
    navigate(`/onboarding/${run.id}`);
  }
};

export const handleTenantChange = (selectedOption) => {
  const orgDb = selectedOption?.value;
  if (!orgDb) {
    applySelectedTenant(null);
    fetchRuns();
    return;
  }
  const tenant = ($onboardingTenants.value || []).find(t => t.orgDb === orgDb);
  handleSelectTenant(tenant || { orgDb, displayName: selectedOption?.label || orgDb });
};

export const uploadFolderFiles = async (runId, fileList) => {
  const files = Array.from(fileList || []);
  if (!files.length) return;

  $onboardingUploadState.update({ isUploading: true, files, progress: 0 });

  try {
    const relativePaths = files.map((f) => f.webkitRelativePath || f.name);
    const signed = await onboardingApi.getSignedUploadUrls(runId, relativePaths);
    const urlEntries = signed?.data || signed || [];

    let completed = 0;
    const queue = [...urlEntries];
    const failedPaths = [];

    const worker = async () => {
      while (queue.length) {
        const entry = queue.shift();
        if (!entry) break;
        const file = files.find(
          (f) => (f.webkitRelativePath || f.name) === entry.relativePath,
        );
        if (!file) continue;
        const contentType = entry.uploadContentType || 'application/octet-stream';
        const response = await fetch(entry.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': contentType },
        });
        if (!response.ok) {
          failedPaths.push(entry.relativePath);
        }
        completed += 1;
        $onboardingUploadState.update({
          progress: Math.round((completed / urlEntries.length) * 100),
        });
      }
    };

    await Promise.all(
      Array.from({ length: UPLOAD_CONCURRENCY }, () => worker()),
    );

    if (failedPaths.length) {
      handleNotification({
        type: 'error',
        message: `Upload failed for ${failedPaths.length} file(s). Nothing was saved — check the network tab and try again.`,
      });
      return;
    }

    await onboardingApi.confirmUploadedFiles(
      runId,
      urlEntries.map((e) => ({
        relativePath: e.relativePath,
        storagePath: e.storagePath,
        sizeBytes: files.find((f) => (f.webkitRelativePath || f.name) === e.relativePath)?.size,
      })),
    );

    handleNotification({
      type: 'success',
      message: `${urlEntries.length} file(s) uploaded to storage.`,
    });
    $onboardingUploadState.update({ isUploading: false, progress: 100 });
    closeUploadModal();
    await fetchRunDetail(runId);
  } catch (err) {
    handleNotification({
      type: 'error',
      message: err?.message || 'Folder upload failed.',
    });
  } finally {
    $onboardingUploadState.update({ isUploading: false });
  }
};

const isDiffRunStatus = (status) => status === 'DIFFING' || status === 'CLASSIFYING';

const isDiffBusy = () => (
  $onboardingDiff.value.isInFlight
  || isDiffRunStatus($onboardingRunDetail.value.run?.status)
);

export const clearOnboardingDiffPoll = () => {
  const { intervalId } = $onboardingDiff.value;
  if (intervalId != null) clearInterval(intervalId);
  $onboardingDiff.update({
    intervalId: null,
    isInFlight: false,
    generation: ($onboardingDiff.value.generation || 0) + 1,
  });
};

const notifyDiffSettled = (status, sawInProgress, statusAtStart) => {
  const failed = status === 'FAILED';
  const becameReady = status === 'READY_FOR_REVIEW'
    && (sawInProgress || statusAtStart !== 'READY_FOR_REVIEW');
  const leftInProgress = sawInProgress && !isDiffRunStatus(status);
  if (!failed && !becameReady && !leftInProgress) return false;
  if ($onboardingDiff.value.resultClaimed) return true;
  $onboardingDiff.update({ resultClaimed: true });
  clearOnboardingDiffPoll();
  handleNotification({
    variant: failed ? 'danger' : 'success',
    message: failed
      ? 'Diff and classification failed.'
      : 'Diff and classification finished. The table is up to date.',
  });
  return true;
};

const startOnboardingDiffPoll = (runId, statusAtStart) => {
  const existing = $onboardingDiff.value.intervalId;
  if (existing != null) clearInterval(existing);

  const generation = ($onboardingDiff.value.generation || 0) + 1;
  const startedAt = Date.now();
  let sawInProgress = isDiffRunStatus($onboardingRunDetail.value.run?.status);
  let ticking = false;

  const intervalId = setInterval(() => {
    if (ticking) return;
    ticking = true;
    const tick = async () => {
      if ($onboardingDiff.value.generation !== generation) return;
      if ($onboardingDiff.value.activeRunId !== runId) return;

      if (Date.now() - startedAt >= ONBOARDING_DIFF_POLL_TIMEOUT_MS) {
        if ($onboardingDiff.value.resultClaimed) return;
        $onboardingDiff.update({ resultClaimed: true });
        clearOnboardingDiffPoll();
        handleNotification({
          variant: 'warning',
          message: 'Diff and classification is still running. Refresh the page to check status.',
        });
        return;
      }

      try {
        await fetchRunDetail(runId, { silent: true });
      } catch {
        return;
      }
      if ($onboardingDiff.value.generation !== generation) return;
      if ($onboardingDiff.value.activeRunId !== runId) return;
      if ($onboardingRunDetail.value.run?.id && $onboardingRunDetail.value.run.id !== runId) return;

      const status = $onboardingRunDetail.value.run?.status;
      if (isDiffRunStatus(status)) {
        sawInProgress = true;
        return;
      }
      notifyDiffSettled(status, sawInProgress, statusAtStart);
    };
    tick().finally(() => {
      ticking = false;
    });
  }, ONBOARDING_DIFF_POLL_MS);

  $onboardingDiff.update({
    intervalId,
    isInFlight: true,
    generation,
    activeRunId: runId,
  });
};

export const resumeDiffPollingIfNeeded = (runId) => {
  if ($onboardingDiff.value.activeRunId !== runId) return;
  const status = $onboardingRunDetail.value.run?.status;
  if (!isDiffRunStatus(status)) return;
  $onboardingDiff.update({ resultClaimed: false, isInFlight: true, activeRunId: runId });
  startOnboardingDiffPoll(runId, status);
};

export const handleStartDiff = async (runId) => {
  if (isDiffBusy()) return;

  const statusAtStart = $onboardingRunDetail.value.run?.status;
  const startedAtMs = Date.now();
  $onboardingDiff.update({
    isInFlight: true,
    activeRunId: runId,
    resultClaimed: false,
  });
  startOnboardingDiffPoll(runId, statusAtStart);
  try {
    await onboardingApi.startDiff(runId);
    const requestMs = Date.now() - startedAtMs;
    if ($onboardingDiff.value.activeRunId !== runId) return;
    if ($onboardingDiff.value.resultClaimed) return;
    await fetchRunDetail(runId);
    if ($onboardingDiff.value.activeRunId !== runId) return;
    if ($onboardingDiff.value.resultClaimed) return;
    const nextStatus = $onboardingRunDetail.value.run?.status;
    const inlineFinished = requestMs >= 1500 && nextStatus === 'READY_FOR_REVIEW';
    notifyDiffSettled(
      nextStatus,
      isDiffRunStatus(nextStatus) || inlineFinished,
      statusAtStart,
    );
  } catch (err) {
    if ($onboardingDiff.value.activeRunId !== runId) return;
    if ($onboardingDiff.value.resultClaimed) {
      clearOnboardingDiffPoll();
      return;
    }
    $onboardingDiff.update({ resultClaimed: true });
    clearOnboardingDiffPoll();
    try {
      await fetchRunDetail(runId);
    } catch {
      /* keep the last loaded run */
    }
    const failed = $onboardingRunDetail.value.run?.status === 'FAILED';
    handleNotification({
      variant: 'danger',
      message: failed
        ? 'Diff and classification failed.'
        : notificationMessage(err, 'Could not start diff and classification.'),
    });
  }
};

export const handleStartImport = async (runId) => {
  if (isDiffBusy()) return;
  await onboardingApi.startImport(runId);
  await fetchRunDetail(runId);
};

export const handleConfirmMatch = async (itemId, runId) => {
  const form = $onboardingMatchForm.value;
  const folderPath = (form.selectedFolderPath || '').trim();
  await onboardingApi.confirmItemMatch(itemId, {
    borrowerId: form.borrowerId,
    loanId: form.loanId,
    borrowerName: form.selectedBorrowerName,
    ...(folderPath ? { folderPath } : {}),
  });
  closeMatchModal();
  await fetchRunDetail(runId);
};

export const handleIgnoreItem = async (itemId, runId) => {
  await onboardingApi.confirmItemMatch(itemId, { ignored: true });
  closeMatchModal();
  await fetchRunDetail(runId);
};
