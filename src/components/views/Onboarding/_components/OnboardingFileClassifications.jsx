import { Badge } from 'react-bootstrap';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import SignalTable from '@src/components/global/SignalTable';
import {
  $onboardingFileDrafts,
  $onboardingFiles,
  $onboardingFileView,
  $onboardingRunDetail,
  DIFF_STATUS_BADGE,
  FILE_TABLE_HEADERS,
  GEMINI_SCAN_STATUS_BADGE,
} from '../_helpers/onboarding.consts';
import {
  handleSaveFileDocumentType,
  markFileDocumentTypeDirty,
} from '../_helpers/onboarding.events';
import {
  canSaveFileDocumentType,
  documentTypeOptionsForFile,
  formatDocumentTypeConfidence,
  geminiScanStatusLabel,
} from '../_helpers/onboarding.helpers';

const OnboardingFileClassifications = () => {
  const runId = $onboardingRunDetail.value.run?.id;
  const documentTypeOptions = $onboardingFiles.value.documentTypeOptions || [];
  const drafts = $onboardingFileDrafts.value || {};
  const { isTableLoading, hasLoaded, savingFileId } = $onboardingFileView.value;
  const files = $onboardingFiles.value.list || [];
  const showEmpty = hasLoaded && !isTableLoading && files.length === 0;

  const rows = files.map((file) => {
    const draft = drafts[file.id] || '';
    const isSaving = savingFileId === file.id;
    const canSave = canSaveFileDocumentType(file.documentType, draft, isSaving);
    return {
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
        <Badge bg={DIFF_STATUS_BADGE[file.diffStatus] || 'secondary'}>{file.diffStatus}</Badge>
      ),
      geminiScan: () => (
        <div>
          <Badge bg={GEMINI_SCAN_STATUS_BADGE[file.geminiScanStatus] || 'secondary'}>
            {geminiScanStatusLabel(file.geminiScanStatus)}
          </Badge>
          {file.geminiScanError && (
            <div className="small text-danger mt-8">{file.geminiScanError}</div>
          )}
        </div>
      ),
    };
  });

  return (
    <section className="mt-24">
      <h2 className="h5 text-light mb-8">File classifications</h2>
      {showEmpty ? (
        <p className="text-info-200 mb-0">No files uploaded for this run yet.</p>
      ) : (
        <SignalTable
          $view={$onboardingFileView}
          headers={FILE_TABLE_HEADERS}
          rows={rows}
          hasPagination={false}
          rowCursor="default"
        />
      )}
    </section>
  );
};

export default OnboardingFileClassifications;
