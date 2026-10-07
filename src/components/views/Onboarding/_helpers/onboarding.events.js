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
  ONBOARDING_DIFF_POLL_MS,
  ONBOARDING_DIFF_POLL_TIMEOUT_MS,
  ONBOARDING_SCAN_POLL_MS,
  ONBOARDING_SCAN_POLL_TIMEOUT_MS,
} from './onboarding.consts';
import { runHasActiveFileScan } from './onboarding.helpers';
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

export const openUploadModal = (runId) => {
  $onboardingView.update({ showUploadModal: true, selectedRunId: runId });
  $onboardingUploadState.reset();
};

export const closeUploadModal = () => {
  $onboardingView.update({ showUploadModal: false });
};

export const openOnboardingRun = (navigate, runId) => {
  if (typeof navigate === 'function' && runId) {
    navigate(`/onboarding/${runId}`);
  }
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

  let run;
  try {
    const res = await onboardingApi.createRun(fd);
    run = res?.data ?? res;
  } catch (err) {
    dangerAlert(notificationMessage(err, 'Could not create the onboarding run.'));
    return;
  }

  if (run?.orgDb) {
    const tenant = ($onboardingTenants.value || []).find(t => t.orgDb === run.orgDb);
    applySelectedTenant(tenant || { orgDb: run.orgDb, displayName: run.orgDb });
  }
  successAlert('Onboarding run created.');
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

    successAlert(`${urlEntries.length} file(s) uploaded to storage.`);
    $onboardingUploadState.update({ isUploading: false, progress: 100 });
    closeUploadModal();
    await fetchRunDetail(runId);
  } catch (err) {
    dangerAlert(notificationMessage(err, 'Folder upload failed.'));
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
    const settled = notifyDiffSettled(
      nextStatus,
      isDiffRunStatus(nextStatus) || inlineFinished,
      statusAtStart,
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

export const handleStartImport = async (runId) => {
  if (isDiffBusy()) return;
  try {
    const response = await onboardingApi.startImport(runId);
    const result = response?.data ?? response ?? {};
    const enqueued = Number(result.enqueued ?? 0);
    await fetchRunDetail(runId);
    if (enqueued > 0) {
      successAlert(`Import queued for ${enqueued} borrower${enqueued === 1 ? '' : 's'}.`);
    } else {
      handleNotification({
        variant: 'warning',
        message: 'No borrowers were queued for import. Confirm a match first.',
      });
    }
  } catch (err) {
    dangerAlert(notificationMessage(err, 'Could not start import.'));
  }
};

export const handleConfirmMatch = async (itemId, runId) => {
  const form = $onboardingMatchForm.value;
  const folderPath = (form.selectedFolderPath || '').trim();
  try {
    await onboardingApi.confirmItemMatch(itemId, {
      borrowerId: form.borrowerId,
      loanId: form.loanId,
      borrowerName: form.selectedBorrowerName,
      ...(folderPath ? { folderPath } : {}),
    });
    closeMatchModal();
    await fetchRunDetail(runId);
    successAlert('Match saved.');
  } catch (err) {
    dangerAlert(notificationMessage(err, 'Could not save the match.'));
  }
};

export const handleIgnoreItem = async (itemId, runId) => {
  try {
    await onboardingApi.confirmItemMatch(itemId, { ignored: true });
    closeMatchModal();
    await fetchRunDetail(runId);
    successAlert('Borrower ignored.');
  } catch (err) {
    dangerAlert(notificationMessage(err, 'Could not ignore this borrower.'));
  }
};

export const resetOnboardingFileReview = () => {
  clearOnboardingScanPoll();
  $onboardingFiles.update({ list: [], documentTypeOptions: [], loadedRunId: null });
  $onboardingFileDrafts.reset();
  $onboardingItemFilter.update({ page: 1, limit: 10 });
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

export const handleStartFileScan = async (runId, fileIds) => {
  if ($onboardingScan.value.isInFlight) return;
  $onboardingScan.update({ isInFlight: true, activeRunId: runId });
  try {
    const response = await onboardingApi.startFileScan(runId, fileIds);
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
      handleNotification({
        variant: 'success',
        message: `Queued scan for ${enqueued} file${enqueued === 1 ? '' : 's'}.`,
      });
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
  } catch (err) {
    handleNotification({
      variant: 'danger',
      message: notificationMessage(err, 'Could not start file scan.'),
    });
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
