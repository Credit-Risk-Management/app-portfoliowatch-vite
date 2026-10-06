import { onboardingApi } from '@src/api/onboarding.api';
import {
  $onboardingCreateForm,
  $onboardingUploadState,
  $onboardingView,
  $onboardingMatchForm,
  $onboardingTenantPick,
} from './onboarding.consts';
import {
  applySelectedTenant,
  fetchRunDetail,
  fetchRuns,
  loadMatchCandidates,
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
  $onboardingTenantPick.reset();
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

export const handleCreateRun = async () => {
  const form = $onboardingCreateForm.value;
  const fd = new FormData();
  fd.append('name', form.name);
  if (form.dropboxFolderName) fd.append('dropboxFolderName', form.dropboxFolderName);
  if (form.masterListFile) fd.append('masterList', form.masterListFile);
  await onboardingApi.createRun(fd);
  closeCreateModal();
  await fetchRuns();
};

export const uploadFolderFiles = async (runId, fileList) => {
  const files = Array.from(fileList || []);
  if (!files.length) return;

  $onboardingUploadState.update({ isUploading: true, files, progress: 0 });

  const relativePaths = files.map((f) => f.webkitRelativePath || f.name);
  const signed = await onboardingApi.getSignedUploadUrls(runId, relativePaths);
  const urlEntries = signed?.data || signed || [];

  let completed = 0;
  const queue = [...urlEntries];

  const worker = async () => {
    while (queue.length) {
      const entry = queue.shift();
      if (!entry) break;
      const file = files.find(
        (f) => (f.webkitRelativePath || f.name) === entry.relativePath,
      );
      if (!file) continue;
      await fetch(entry.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });
      completed += 1;
      $onboardingUploadState.update({
        progress: Math.round((completed / urlEntries.length) * 100),
      });
    }
  };

  await Promise.all(
    Array.from({ length: UPLOAD_CONCURRENCY }, () => worker()),
  );

  await onboardingApi.confirmUploadedFiles(
    runId,
    urlEntries.map((e) => ({
      relativePath: e.relativePath,
      storagePath: e.storagePath,
      sizeBytes: files.find((f) => (f.webkitRelativePath || f.name) === e.relativePath)?.size,
    })),
  );

  $onboardingUploadState.update({ isUploading: false, progress: 100 });
  closeUploadModal();
  await fetchRunDetail(runId);
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
