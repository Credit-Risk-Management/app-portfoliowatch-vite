import { onboardingApi } from '@src/api/onboarding.api';
import {
  $onboardingCreateForm,
  $onboardingUploadState,
  $onboardingView,
  $onboardingMatchForm,
  $onboardingTenantPick,
  $onboardingTenants,
  $onboardingSelectedTenant,
} from './onboarding.consts';
import { handleNotification } from '@src/components/global/Alert/_helpers/alert.events';
import {
  applySelectedTenant,
  fetchRunDetail,
  fetchRuns,
  loadMatchCandidates,
  syncTenantFromPickSignal,
} from './onboarding.resolvers';

const UPLOAD_CONCURRENCY = 5;

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
  $onboardingView.update({ showMatchModal: true, selectedItemId: itemId });
  await loadMatchCandidates(itemId);
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

export const handleStartDiff = async (runId) => {
  await onboardingApi.startDiff(runId);
  await fetchRunDetail(runId);
};

export const handleStartImport = async (runId) => {
  await onboardingApi.startImport(runId);
  await fetchRunDetail(runId);
};

export const handleConfirmMatch = async (itemId, runId) => {
  const form = $onboardingMatchForm.value;
  await onboardingApi.confirmItemMatch(itemId, {
    borrowerId: form.borrowerId,
    loanId: form.loanId,
    borrowerName: form.selectedBorrowerName,
  });
  closeMatchModal();
  await fetchRunDetail(runId);
};

export const handleIgnoreItem = async (itemId, runId) => {
  await onboardingApi.confirmItemMatch(itemId, { ignored: true });
  closeMatchModal();
  await fetchRunDetail(runId);
};
