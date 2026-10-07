import { Button, Col, Row } from 'react-bootstrap';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import SignalTable from '@src/components/global/SignalTable';
import { PAGE_LIMIT_OPTIONS } from '@src/consts/consts';
import {
  $onboardingFileDrafts,
  $onboardingFiles,
  $onboardingFileView,
  $onboardingRunDetail,
  $onboardingScan,
  DIFF_STATUS_BADGE,
  FILE_TABLE_HEADERS,
  GEMINI_SCAN_STATUS_BADGE,
} from '../_helpers/onboarding.consts';
import {
  handleSaveFileDocumentType,
  handleStartFileScan,
  markFileDocumentTypeDirty,
} from '../_helpers/onboarding.events';
import OnboardingStatusBadge from './OnboardingStatusBadge';
import {
  canSaveFileDocumentType,
  documentTypeOptionsForFile,
  formatDocumentTypeConfidence,
  geminiScanStatusLabel,
  paginateList,
} from '../_helpers/onboarding.helpers';

const OnboardingFileClassificationsTable = ({
  files,
  $filter,
  $selectionView,
  showFolderColumn = true,
  showScanControls = true,
  scanAllOmitsFileIds = true,
  emptyMessage = 'No files uploaded for this run yet.',
}) => {
  const runId = $onboardingRunDetail.value.run?.id;
  const documentTypeOptions = $onboardingFiles.value.documentTypeOptions || [];
  const drafts = $onboardingFileDrafts.value || {};
  const { isTableLoading, hasLoaded, savingFileId } = $onboardingFileView.value;
  const scanBusy = $onboardingScan.value.isInFlight;
  const fileList = files || [];
  const showEmpty = hasLoaded && !isTableLoading && fileList.length === 0;

  const { items: pageFiles, totalCount, currentPage, pageLimit } = paginateList(
    fileList,
    $filter.value.page,
    $filter.value.limit,
  );

  const headers = showFolderColumn
    ? FILE_TABLE_HEADERS
    : FILE_TABLE_HEADERS.filter((header) => header.key !== 'folder');

  const selectedIds = ($selectionView.value.selectedItems || []).map((row) => row.id);
  const allScopeIds = fileList.map((file) => file.id);

  const rows = pageFiles.map((file) => {
    const draft = drafts[file.id] || '';
    const isSaving = savingFileId === file.id;
    const canSave = canSaveFileDocumentType(file.documentType, draft, isSaving);
    return {
      id: file.id,
      fileName: file.fileName,
      folder: file.folder || '—',
      borrowerName: file.borrowerName || '—',
      documentType: () => (
        <div className="d-flex align-items-center gap-8">
          <div className="flex-grow-1">
            <SelectInput
              name={file.id}
              signal={$onboardingFileDrafts}
              options={documentTypeOptionsForFile(documentTypeOptions, file.documentType)}
              value={draft}
              notClearable
              isPortal
              placeholder="Select type"
              isDisabled={isSaving}
              onChange={() => markFileDocumentTypeDirty(file.id)}
            />
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary-100 text-nowrap"
            disabled={!canSave}
            onClick={(event) => {
              event.stopPropagation();
              handleSaveFileDocumentType(file.id, runId);
            }}
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      ),
      confidence: formatDocumentTypeConfidence(file.documentTypeConfidence),
      diffStatus: () => (
        <OnboardingStatusBadge badgeMap={DIFF_STATUS_BADGE} statusKey={file.diffStatus} />
      ),
      geminiScan: () => (
        <div>
          <OnboardingStatusBadge badgeMap={GEMINI_SCAN_STATUS_BADGE} statusKey={file.geminiScanStatus}>
            {geminiScanStatusLabel(file.geminiScanStatus)}
          </OnboardingStatusBadge>
          {file.geminiScanError && (
            <div className="small text-danger mt-8">{file.geminiScanError}</div>
          )}
        </div>
      ),
    };
  });

  const onScanAll = () => {
    if (!runId) return;
    const fileIds = scanAllOmitsFileIds ? undefined : allScopeIds;
    handleStartFileScan(runId, fileIds);
  };

  const onScanSelected = () => {
    if (!runId || !selectedIds.length) return;
    handleStartFileScan(runId, selectedIds);
  };

  if (showEmpty) {
    return <p className="text-info-200 mb-0">{emptyMessage}</p>;
  }

  return (
    <>
      {showScanControls && (
        <Row className="mb-8 align-items-center justify-content-between">
          <Col xs="auto" className="d-flex flex-wrap gap-8">
            <Button
              variant="outline-primary-100"
              size="sm"
              disabled={scanBusy || !fileList.length}
              onClick={onScanAll}
            >
              Scan all
            </Button>
            <Button
              variant="outline-primary-100"
              size="sm"
              disabled={scanBusy || !selectedIds.length}
              onClick={onScanSelected}
            >
              Scan selected
            </Button>
          </Col>
          <Col xs="auto" className="d-flex align-items-center gap-2">
            <span className="text-info-100 text-nowrap small me-4">Rows per page</span>
            <SelectInput
              options={PAGE_LIMIT_OPTIONS}
              value={$filter.value.limit}
              onChange={() => $filter.update({ page: 1 })}
              placeholder="Limit"
              signal={$filter}
              name="limit"
              isMulti={false}
              isSearchable={false}
              notClearable
            />
          </Col>
        </Row>
      )}
      <SignalTable
        $filter={$filter}
        $view={$selectionView}
        headers={headers}
        rows={rows}
        hasCheckboxes={showScanControls}
        hasPagination
        syncUrl={false}
        totalCount={totalCount}
        currentPage={currentPage}
        currentPageItemsCount={pageFiles.length}
        itemsPerPageAmount={pageLimit}
        rowCursor="default"
      />
    </>
  );
};

export default OnboardingFileClassificationsTable;
