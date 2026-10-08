import { resolvePageLimit } from '@src/consts/consts';

export function canQuickConfirmMatch(item) {
  const status = item?.matchStatus;
  if (status === 'CONFIRMED' || status === 'IGNORED' || status === 'UNMATCHED') return false;
  return Boolean((item?.folderPath || '').trim());
}

export function itemNeedsAttention(item) {
  return item.matchStatus === 'NEEDS_REVIEW'
    || item.matchStatus === 'UNMATCHED'
    || item.importStatus === 'FAILED';
}

export function filterOnboardingItems(items, filter) {
  const search = (filter?.searchTerm || '').trim().toLowerCase();
  const matchStatus = filter?.matchStatus || '';
  const importStatus = filter?.importStatus || '';
  const hasStatusFilter = Boolean(matchStatus || importStatus);
  const needsAttentionOnly = filter?.needsAttentionOnly === true && !hasStatusFilter;

  return (items || []).filter((item) => {
    if (needsAttentionOnly && !itemNeedsAttention(item)) return false;
    if (matchStatus && item.matchStatus !== matchStatus) return false;
    if (importStatus && item.importStatus !== importStatus) return false;
    if (!search) return true;
    const haystack = [
      item.borrowerName,
      item.loanNumber,
      item.folderPath,
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(search);
  });
}

export function paginateList(list, page, limit) {
  const pageLimit = resolvePageLimit(limit);
  const totalCount = (list || []).length;
  const pagesCount = Math.max(1, Math.ceil(totalCount / pageLimit));
  const safePage = Math.min(Math.max(1, Number(page) || 1), pagesCount);
  const start = (safePage - 1) * pageLimit;
  return {
    items: (list || []).slice(start, start + pageLimit),
    totalCount,
    currentPage: safePage,
    pageLimit,
  };
}

export function filesForFolderPath(files, folderPath) {
  if (!folderPath) return [];
  return (files || []).filter((file) => file.folder === folderPath);
}

export function isApplicationDocumentType(documentType) {
  return documentType === 'application';
}

/** Application documents are not part of task scan and cannot be selected. */
export function filesForTaskScan(files) {
  return (files || []).filter((file) => !isApplicationDocumentType(file?.documentType));
}

export function runHasActiveFileScan(files) {
  return (files || []).some(
    (file) => file.geminiScanStatus === 'queued' || file.geminiScanStatus === 'running',
  );
}

export function buildMatchFolderOptions(folders, item) {
  const borrower = (item?.borrowerName || '').trim().toLowerCase();
  const loan = (item?.loanNumber || '').trim().toLowerCase();
  const relevance = (folder) => {
    const path = (folder?.path || '').toLowerCase();
    const matchesBorrower = Boolean(borrower) && path.includes(borrower);
    const matchesLoan = Boolean(loan) && path.includes(loan);
    return matchesBorrower || matchesLoan ? 0 : 1;
  };

  return [...(folders || [])].sort((a, b) => {
    const rank = relevance(a) - relevance(b);
    if (rank !== 0) return rank;
    return (a.path || '').localeCompare(b.path || '');
  }).map((folder) => {
    const assignedElsewhere = folder.assignedItemId && folder.assignedItemId !== item?.id;
    let label = folder.path;
    if (assignedElsewhere) {
      const who = [folder.assignedBorrowerName, folder.assignedLoanNumber].filter(Boolean).join(' ');
      label = who
        ? `${folder.path} (assigned to ${who})`
        : `${folder.path} (assigned to another borrower)`;
    }
    return { value: folder.path, label };
  });
}

export function isFolderAssignedToOtherItem(folders, selectedPath, itemId) {
  const folder = (folders || []).find((row) => row.path === selectedPath);
  return Boolean(folder?.assignedItemId && folder.assignedItemId !== itemId);
}

export function onboardingDiffButtonLabel(runStatus, diffBusy) {
  if (runStatus === 'CLASSIFYING') return 'Classifying…';
  if (diffBusy) return 'Diffing…';
  return 'Diff & classify';
}

export function onboardingDiffStatusMessage(runStatus) {
  if (runStatus === 'CLASSIFYING') {
    return 'Classifying folders. The table will update when this finishes.';
  }
  return 'Diffing files. The table will update when this finishes.';
}

export function onboardingImportStatusMessage() {
  return 'Importing borrowers. File scan will start when import finishes.';
}

export function formatDocumentTypeConfidence(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `${Math.round(Number(value) * 100)}%`;
}

export function geminiScanStatusLabel(status) {
  if (status === 'queued') return 'Queued';
  if (status === 'running') return 'Running';
  if (status === 'completed') return 'Completed';
  if (status === 'failed') return 'Failed';
  return 'Not scanned';
}

export function documentTypeOptionsForFile(options, currentType) {
  const list = options || [];
  if (currentType && !list.some((option) => option.value === currentType)) {
    return [...list, { value: currentType, label: currentType }];
  }
  return list;
}

export function canSaveFileDocumentType(savedType, draft, isSaving) {
  if (isSaving || !draft) return false;
  return draft !== (savedType || '');
}
