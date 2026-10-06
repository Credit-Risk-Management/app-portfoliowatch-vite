import { ProgressBar } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import FileUploader from '@src/components/global/FileUploader';
import { $onboardingUploadState, $onboardingView } from '../_helpers/onboarding.consts';
import { closeUploadModal, uploadFolderFiles } from '../_helpers/onboarding.events';

const UploadFolderModal = () => {
  const runId = $onboardingView.value.selectedRunId;

  return (
    <UniversalModal
      show={$onboardingView.value.showUploadModal && Boolean(runId)}
      onHide={closeUploadModal}
      closeButton
      headerText="Upload borrower folders"
      leftBtnText="Cancel"
      rightBtnText="Upload to storage"
      rightButtonDisabled={
        $onboardingUploadState.value.isUploading
        || !($onboardingUploadState.value.files?.length)
      }
      rightBtnOnClick={() => uploadFolderFiles(runId, $onboardingUploadState.value.files)}
      size="lg"
    >
      <div className="text-white mt-16">
        <p className="text-info-200 small mb-16">
          Select a folder from your computer. File paths are preserved for classification and diff.
        </p>
        <FileUploader
          id="onboarding-folder-input"
          directory
          signal={$onboardingUploadState}
          name="files"
          variant="dropzone"
          dropzoneDark
        />
        {($onboardingUploadState.value.files?.length ?? 0) > 0 && (
          <p className="text-info-200 small mt-16 mb-0">
            {$onboardingUploadState.value.files.length}
            {' '}
            file(s) ready to upload
          </p>
        )}
        {$onboardingUploadState.value.isUploading && (
          <ProgressBar now={$onboardingUploadState.value.progress} className="mt-16" />
        )}
      </div>
    </UniversalModal>
  );
};

export default UploadFolderModal;
