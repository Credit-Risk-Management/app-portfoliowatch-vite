import { onboardingApi } from '@src/api/onboarding.api';
import { dangerAlert, handleNotification, successAlert } from '@src/components/global/Alert/_helpers/alert.events';
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
  $onboardingFiles,
  $onboardingFileDrafts,
  $onboardingFileView,
  $onboardingFolderFileFilter,
  $onboardingFolderFileView,
  $onboardingItemFilter,
  $onboardingFileFilter,
  $onboardingScan,
  $onboardingImport,
  ONBOARDING_DIFF_POLL_MS,
  ONBOARDING_DIFF_POLL_TIMEOUT_MS,
  ONBOARDING_IMPORT_POLL_MS,
  ONBOARDING_IMPORT_POLL_TIMEOUT_MS,
  ONBOARDING_SCAN_POLL_MS,
  ONBOARDING_SCAN_POLL_TIMEOUT_MS,
} from './onboarding.consts';
import { canQuickConfirmMatch, runHasActiveFileScan } from './onboarding.helpers';
import {
  applySelectedTenant,
  fetchRunDetail,
  fetchRunFiles,
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

export const requestCloseCreateModal = () => {
  if ($onboardingView.value.isCreating) return;
  closeCreateModal();
};

export const openUploadModal = (runId) => {
  $onboardingView.update({ showUploadModal: true, selectedRunId: runId });
  $onboardingUploadState.reset();
};

export const closeUploadModal = () => {
  $onboardingView.update({ showUploadModal: false });
};

export const requestCloseUploadModal = () => {
  if ($onboardingUploadState.value.isUploading) return;
  closeUploadModal();
};

export const openOnboardingRun = (navigate, runId) => {
  if (typeof navigate !== 'function' || !runId) return;
  $onboardingRunDetail.update({ run: null, items: [], isLoading: true });
  $onboardingView.update({ isTableLoading: false });
  navigate(`/onboarding/${runId}`);
};

export const handleOnboardingRunListAction = (navigate, run, action) => {
  if (action === 'open') {
    openOnboardingRun(navigate, run?.id);
  }
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
  $onboardingView.update({
    showMatchModal: true,
    selectedItemId: itemId,
    isLoadingMatch: true,
    isSavingMatch: false,
    matchSaveAction: null,
  });
  try {
    await loadMatchCandidates(itemId);
  } catch (err) {
    handleNotification({
      variant: 'danger',
      message: notificationMessage(err, 'Could not load match options.'),
    });
  } finally {
    $onboardingView.update({ isLoadingMatch: false });
  }
};

export const closeMatchModal = () => {
  $onboardingView.update({
    showMatchModal: false,
    selectedItemId: null,
    isLoadingMatch: false,
    isSavingMatch: false,
    matchSaveAction: null,
  });
};

export const requestCloseMatchModal = () => {
  if ($onboardingView.value.isSavingMatch) return;
  closeMatchModal();
};

export const handleCreateRun = async (navigate) => {
  if ($onboardingView.value.isCreating) return;
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
  if (form.autoContinue) fd.append('autoContinue', 'true');
  if (form.autoScanAfterImport) fd.append('autoScanAfterImport', 'true');

  $onboardingView.update({ isCreating: true });
  try {
    const res = await onboardingApi.createRun(fd);
    const run = res?.data ?? res;
    if (run?.orgDb) {
      const tenant = ($onboardingTenants.value || []).find(t => t.orgDb === run.orgDb);
      applySelectedTenant(tenant || { orgDb: run.orgDb, displayName: run.orgDb });
    }
    successAlert('Onboarding run created.');
    closeCreateModal();
    await fetchRuns();
    if (run?.id && typeof navigate === 'function') {
      openOnboardingRun(navigate, run.id);
    }
  } catch (err) {
    dangerAlert(notificationMessage(err, 'Could not create the onboarding run.'));
  } finally {
    $onboardingView.update({ isCreating: false });
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

const isDiffRunStatus = (status) => status === 'DIFFING' || status === 'CLASSIFYING';

const isDiffBusy = () => (
  $onboardingDiff.value.isInFlight
  || isDiffRunStatus($onboardingRunDetail.value.run?.status)
);

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
      dangerAlert(`Upload failed for ${failedPaths.length} file(s). Nothing was saved — check the network tab and try again.`);
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

    const autoContinue = $onboardingRunDetail.value.run?.autoContinue === true;
    if (autoContinue) {
      await onboardingApi.completeUpload(runId);
      successAlert(
        `${urlEntries.length} file(s) uploaded. Diff, match, and import will continue automatically.`,
      );
    } else {
      successAlert(`${urlEntries.length} file(s) uploaded to storage.`);
    }
    $onboardingUploadState.reset();
    closeUploadModal();
    await fetchRunDetail(runId);
    if (autoContinue && !isDiffBusy()) {
      $onboardingDiff.update({
        activeRunId: runId,
        resultClaimed: false,
        isInFlight: true,
      });
      startOnboardingDiffPoll(runId, $onboardingRunDetail.value.run?.status);
    }
  } catch (err) {
    dangerAlert(notificationMessage(err, 'Folder upload failed.'));
  } finally {
    $onboardingUploadState.update({ isUploading: false });
  }
};

export const clearOnboardingDiffPoll = () => {
  const { intervalId } = $onboardingDiff.value;
  if (intervalId != null) clearInterval(intervalId);
  $onboardingDiff.update({
    intervalId: null,
    isInFlight: false,
    generation: ($onboardingDiff.value.generation || 0) + 1,
  });
};

const notifyDiffSettled = (status, sawInProgress, statusAtStart, runId) => {
  const failed = status === 'FAILED';
  const becameReady = status === 'READY_FOR_REVIEW'
    && (sawInProgress || statusAtStart !== 'READY_FOR_REVIEW');
  const leftInProgress = sawInProgress && !isDiffRunStatus(status);
  const autoImportStarted = status === 'IMPORTING';
  if (!failed && !becameReady && !leftInProgress && !autoImportStarted) return false;
  if ($onboardingDiff.value.resultClaimed) return true;
  $onboardingDiff.update({ resultClaimed: true });
  clearOnboardingDiffPoll();
  if (autoImportStarted && runId) {
    $onboardingImport.update({
      activeRunId: runId,
      autoScanClaimed: false,
      resultClaimed: false,
    });
    startOnboardingImportPoll(runId);
    handleNotification({
      variant: 'success',
      message: 'Classification finished; import is running.',
    });
    return true;
  }
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
      notifyDiffSettled(status, sawInProgress, statusAtStart, runId);
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
  if (isDiffBusy() || $onboardingView.value.isImporting) return;

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
    const settled = notifyDiffSettled(
      nextStatus,
      isDiffRunStatus(nextStatus) || inlineFinished,
      statusAtStart,
      runId,
    );
    if (!settled && !$onboardingDiff.value.resultClaimed) {
      successAlert('Diff and classification started.');
    }
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

const isImportRunInProgress = (status) => status === 'IMPORTING';

export const clearOnboardingImportPoll = () => {
  const { intervalId } = $onboardingImport.value;
  if (intervalId != null) clearInterval(intervalId);
  $onboardingImport.update({
    intervalId: null,
    isPolling: false,
    generation: ($onboardingImport.value.generation || 0) + 1,
  });
};

const triggerAutoScanAfterImport = async (runId) => {
  if ($onboardingRunDetail.value.run?.autoScanAfterImport) return;
  if ($onboardingImport.value.autoScanClaimed) return;
  $onboardingImport.update({ autoScanClaimed: true });
  try {
    await fetchRunFiles(runId);
    const { enqueued } = await handleStartFileScan(runId, undefined, {
      suppressSuccessNotification: true,
    });
    if (enqueued > 0) {
      handleNotification({
        variant: 'success',
        message: 'Import finished; file scan queued.',
      });
    }
  } catch (err) {
    handleNotification({
      variant: 'danger',
      message: notificationMessage(err, 'Import finished but file scan could not start.'),
    });
  }
};

const notifyImportSettled = (status) => {
  if (status !== 'COMPLETED' && status !== 'FAILED') return false;
  if ($onboardingImport.value.resultClaimed) return true;
  $onboardingImport.update({ resultClaimed: true });
  clearOnboardingImportPoll();
  if (status === 'FAILED') {
    handleNotification({
      variant: 'danger',
      message: 'Import failed.',
    });
    return true;
  }
  return true;
};

const startOnboardingImportPoll = (runId) => {
  const existing = $onboardingImport.value.intervalId;
  if (existing != null) clearInterval(existing);

  const generation = ($onboardingImport.value.generation || 0) + 1;
  const startedAt = Date.now();
  let ticking = false;

  const intervalId = setInterval(() => {
    if (ticking) return;
    ticking = true;
    const tick = async () => {
      if ($onboardingImport.value.generation !== generation) return;
      if ($onboardingImport.value.activeRunId !== runId) return;

      if (Date.now() - startedAt >= ONBOARDING_IMPORT_POLL_TIMEOUT_MS) {
        if ($onboardingImport.value.resultClaimed) return;
        $onboardingImport.update({ resultClaimed: true });
        clearOnboardingImportPoll();
        handleNotification({
          variant: 'warning',
          message: 'Import is still running. Refresh the page to check status.',
        });
        return;
      }

      try {
        await fetchRunDetail(runId, { silent: true });
      } catch {
        return;
      }
      if ($onboardingImport.value.generation !== generation) return;
      if ($onboardingImport.value.activeRunId !== runId) return;
      if ($onboardingRunDetail.value.run?.id && $onboardingRunDetail.value.run.id !== runId) return;

      const status = $onboardingRunDetail.value.run?.status;
      if (isImportRunInProgress(status)) return;

      const settled = notifyImportSettled(status);
      if (settled && status === 'COMPLETED') {
        await triggerAutoScanAfterImport(runId);
      }
    };
    tick().finally(() => {
      ticking = false;
    });
  }, ONBOARDING_IMPORT_POLL_MS);

  $onboardingImport.update({
    intervalId,
    isPolling: true,
    generation,
    activeRunId: runId,
    resultClaimed: false,
    autoScanClaimed: false,
  });
};

export const resumeImportPollingIfNeeded = (runId) => {
  if ($onboardingImport.value.activeRunId !== runId) return;
  const status = $onboardingRunDetail.value.run?.status;
  if (!isImportRunInProgress(status)) return;
  $onboardingImport.update({ resultClaimed: false, isPolling: true, activeRunId: runId });
  startOnboardingImportPoll(runId);
};

export const handleStartImport = async (runId) => {
  if (isDiffBusy() || $onboardingView.value.isImporting) return;
  $onboardingView.update({ isImporting: true });
  try {
    const response = await onboardingApi.startImport(runId);
    const result = response?.data ?? response ?? {};
    const enqueued = Number(result.enqueued ?? 0);
    await fetchRunDetail(runId, { silent: true });
    if (enqueued > 0) {
      $onboardingImport.update({ activeRunId: runId, autoScanClaimed: false, resultClaimed: false });
      const statusAfterQueue = $onboardingRunDetail.value.run?.status;
      if (statusAfterQueue === 'COMPLETED') {
        notifyImportSettled('COMPLETED');
        await triggerAutoScanAfterImport(runId);
      } else if (statusAfterQueue === 'FAILED') {
        notifyImportSettled('FAILED');
      } else {
        startOnboardingImportPoll(runId);
      }
      successAlert(`Import queued for ${enqueued} borrower${enqueued === 1 ? '' : 's'}.`);
    } else {
      handleNotification({
        variant: 'warning',
        message: 'No borrowers were queued for import. Confirm a match first.',
      });
    }
  } catch (err) {
    dangerAlert(notificationMessage(err, 'Could not start import.'));
  } finally {
    $onboardingView.update({ isImporting: false });
  }
};

const beginMatchSave = (action) => {
  if ($onboardingView.value.isSavingMatch || $onboardingView.value.isLoadingMatch) return false;
  $onboardingView.update({ isSavingMatch: true, matchSaveAction: action });
  return true;
};

const endMatchSave = () => {
  $onboardingView.update({ isSavingMatch: false, matchSaveAction: null });
};

export const handleQuickConfirmMatch = async (itemId, runId) => {
  if (!beginMatchSave('confirm')) return;
  const item = ($onboardingRunDetail.value.items || []).find((row) => row.id === itemId);
  const folderPath = (item?.folderPath || '').trim();
  if (!item || !folderPath) {
    endMatchSave();
    return;
  }
  $onboardingView.update({ confirmingMatchItemId: itemId });
  try {
    await onboardingApi.confirmItemMatch(itemId, {
      borrowerId: item.matchedBorrowerId,
      loanId: item.matchedLoanId,
      borrowerName: item.borrowerName,
      folderPath,
    });
    await fetchRunDetail(runId, { silent: true });
    successAlert('Match confirmed.');
  } catch (err) {
    dangerAlert(notificationMessage(err, 'Could not confirm the match.'));
  } finally {
    $onboardingView.update({ confirmingMatchItemId: null });
    endMatchSave();
  }
};

export const handleOnboardingMatchStatusClick = (item) => {
  const runId = $onboardingRunDetail.value.run?.id;
  if (!runId || !item?.id || $onboardingView.value.isSavingMatch) return;
  if (item.matchStatus === 'CONFIRMED') return;
  if (canQuickConfirmMatch(item)) {
    handleQuickConfirmMatch(item.id, runId);
    return;
  }
  openMatchModal(item.id);
};

export const handleConfirmMatch = async (itemId, runId) => {
  if (!beginMatchSave('confirm')) return;
  const form = $onboardingMatchForm.value;
  const folderPath = (form.selectedFolderPath || '').trim();
  try {
    await onboardingApi.confirmItemMatch(itemId, {
      borrowerId: form.borrowerId,
      loanId: form.loanId,
      borrowerName: form.selectedBorrowerName,
      ...(folderPath ? { folderPath } : {}),
    });
    await fetchRunDetail(runId, { silent: true });
    closeMatchModal();
    successAlert('Match saved.');
  } catch (err) {
    dangerAlert(notificationMessage(err, 'Could not save the match.'));
  } finally {
    endMatchSave();
  }
};

export const handleIgnoreItem = async (itemId, runId) => {
  if (!beginMatchSave('ignore')) return;
  try {
    await onboardingApi.confirmItemMatch(itemId, { ignored: true });
    await fetchRunDetail(runId, { silent: true });
    closeMatchModal();
    successAlert('Borrower ignored.');
  } catch (err) {
    dangerAlert(notificationMessage(err, 'Could not ignore this borrower.'));
  } finally {
    endMatchSave();
  }
};

export const resetOnboardingFileReview = () => {
  clearOnboardingImportPoll();
  clearOnboardingScanPoll();
  $onboardingFiles.update({ list: [], documentTypeOptions: [], loadedRunId: null });
  $onboardingFileDrafts.reset();
  $onboardingItemFilter.update({
    page: 1,
    limit: 10,
    searchTerm: '',
    matchStatus: '',
    importStatus: '',
  });
  $onboardingFileFilter.update({ page: 1, limit: 10 });
  $onboardingFolderFileFilter.update({ page: 1, limit: 10 });
  $onboardingFileView.update({
    isTableLoading: true,
    hasLoaded: false,
    savingFileId: null,
    dirtyFileIds: {},
    selectedItems: [],
    isSelectAllChecked: false,
  });
  $onboardingFolderFileView.update({ selectedItems: [], isSelectAllChecked: false });
  $onboardingScan.update({
    isInFlight: false,
    intervalId: null,
    generation: 0,
    activeRunId: null,
  });
};

export const beginOnboardingRunLoad = (runId) => {
  resetOnboardingFileReview();
  $onboardingRunDetail.update({
    run: null,
    items: [],
    isLoading: Boolean(runId),
  });
  $onboardingView.update({ isTableLoading: false, isImporting: false });
  $onboardingDiff.update({ activeRunId: runId || null });
  $onboardingImport.update({
    activeRunId: runId || null,
    autoScanClaimed: false,
    resultClaimed: false,
  });
};

export const openFolderFilesModal = (itemId, folderPath) => {
  $onboardingFolderFileView.update({ selectedItems: [], isSelectAllChecked: false });
  $onboardingFolderFileFilter.update({ page: 1 });
  $onboardingView.update({
    showFolderFilesModal: true,
    folderFilesItemId: itemId,
    folderFilesPath: folderPath,
  });
};

export const handleOnboardingItemAction = (item, action) => {
  if (action === 'match') {
    openMatchModal(item?.id);
    return;
  }
  if (action === 'classifications' && item?.folderPath) {
    openFolderFilesModal(item.id, item.folderPath);
  }
};

export const closeFolderFilesModal = () => {
  $onboardingView.update({
    showFolderFilesModal: false,
    folderFilesItemId: null,
    folderFilesPath: null,
  });
};

export const clearOnboardingScanPoll = () => {
  const { intervalId } = $onboardingScan.value;
  if (intervalId != null) clearInterval(intervalId);
  $onboardingScan.update({ intervalId: null, isInFlight: false });
};

export const startOnboardingScanPoll = (runId) => {
  clearOnboardingScanPoll();
  const generation = ($onboardingScan.value.generation || 0) + 1;
  const startedAt = Date.now();
  let ticking = false;

  const intervalId = setInterval(() => {
    if (ticking) return;
    ticking = true;
    const tick = async () => {
      if ($onboardingScan.value.generation !== generation) return;
      if ($onboardingScan.value.activeRunId !== runId) return;

      if (Date.now() - startedAt >= ONBOARDING_SCAN_POLL_TIMEOUT_MS) {
        clearOnboardingScanPoll();
        handleNotification({
          variant: 'warning',
          message: 'File scan is still running. Refresh the page to check status.',
        });
        return;
      }

      try {
        await fetchRunFiles(runId);
      } catch {
        return;
      }
      if ($onboardingScan.value.generation !== generation) return;
      if (!runHasActiveFileScan($onboardingFiles.value.list)) {
        clearOnboardingScanPoll();
      }
    };
    tick().finally(() => {
      ticking = false;
    });
  }, ONBOARDING_SCAN_POLL_MS);

  $onboardingScan.update({
    intervalId,
    generation,
    activeRunId: runId,
  });
};

export const resumeScanPollingIfNeeded = (runId) => {
  if ($onboardingScan.value.activeRunId && $onboardingScan.value.activeRunId !== runId) return;
  if (!runHasActiveFileScan($onboardingFiles.value.list)) return;
  startOnboardingScanPoll(runId);
};

export const handleStartFileScan = async (
  runId,
  fileIds,
  { followPfsPackageCompanions, suppressSuccessNotification = false } = {},
) => {
  if ($onboardingScan.value.isInFlight) return { enqueued: 0 };
  $onboardingScan.update({ isInFlight: true, activeRunId: runId });
  try {
    const response = await onboardingApi.startFileScan(runId, {
      fileIds,
      followPfsPackageCompanions,
    });
    const result = response?.data ?? response ?? {};
    const enqueued = result.enqueuedFileIds?.length ?? result.enqueuedTasks ?? 0;
    const skippedList = result.skipped || [];
    const skipped = skippedList.length;
    const importRequiredCount = skippedList.filter(
      (row) => row.reason === 'IMPORT_REQUIRED_FOR_CREDIT_MEMO',
    ).length;
    await fetchRunFiles(runId);
    if (enqueued > 0) {
      startOnboardingScanPoll(runId);
      if (!suppressSuccessNotification) {
        handleNotification({
          variant: 'success',
          message: `Queued scan for ${enqueued} file${enqueued === 1 ? '' : 's'}.`,
        });
      }
      if (importRequiredCount > 0) {
        handleNotification({
          variant: 'warning',
          message: `${importRequiredCount} credit memo file${importRequiredCount === 1 ? '' : 's'} skipped — import the run before scanning credit memos.`,
        });
      }
    } else {
      const importOnlySkip = skipped > 0 && importRequiredCount === skipped;
      handleNotification({
        variant: 'warning',
        message: importOnlySkip
          ? 'Import the run before scanning credit memos.'
          : skipped
            ? 'No files were queued. Confirm folder match or wait for in-flight scans to finish.'
            : 'No files available to scan.',
      });
    }
    return { enqueued };
  } catch (err) {
    handleNotification({
      variant: 'danger',
      message: notificationMessage(err, 'Could not start file scan.'),
    });
    return { enqueued: 0 };
  } finally {
    $onboardingScan.update({ isInFlight: false });
  }
};

export const markFileDocumentTypeDirty = (fileId) => {
  const files = $onboardingFiles.value.list || [];
  const saved = files.find((file) => file.id === fileId)?.documentType || '';
  const draft = ($onboardingFileDrafts.value || {})[fileId] || '';
  const dirtyFileIds = { ...($onboardingFileView.value.dirtyFileIds || {}) };
  if (draft !== saved) dirtyFileIds[fileId] = true;
  else delete dirtyFileIds[fileId];
  $onboardingFileView.update({ dirtyFileIds });
};

export const handleSaveFileDocumentType = async (fileId, runId) => {
  const documentType = ($onboardingFileDrafts.value || {})[fileId];
  if (!documentType || !runId) return;
  $onboardingFileView.update({ savingFileId: fileId });
  try {
    await onboardingApi.updateFileDocumentType(fileId, documentType);
    const dirtyFileIds = { ...($onboardingFileView.value.dirtyFileIds || {}) };
    delete dirtyFileIds[fileId];
    $onboardingFileView.update({ dirtyFileIds });
    await fetchRunFiles(runId);
    handleNotification({
      variant: 'success',
      message: 'Document type saved.',
    });
  } catch (err) {
    handleNotification({
      variant: 'danger',
      message: notificationMessage(err, 'Could not save document type.'),
    });
  } finally {
    if ($onboardingFileView.value.savingFileId === fileId) {
      $onboardingFileView.update({ savingFileId: null });
    }
  }
};
