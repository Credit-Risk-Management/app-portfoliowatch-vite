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
