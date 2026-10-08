import { Button, ProgressBar, Spinner } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import FileUploader from '@src/components/global/FileUploader';
import { handleBrowse } from '@src/components/global/FileUploader/_helpers/fileUploader.events';
import { $onboardingUploadState, $onboardingView } from '../_helpers/onboarding.consts';
import { requestCloseUploadModal, uploadFolderFiles } from '../_helpers/onboarding.events';

const ONBOARDING_FOLDER_INPUT_ID = 'onboarding-folder-input';

const UploadFolderModal = () => {
  const runId = $onboardingView.value.selectedRunId;
  const { isUploading } = $onboardingUploadState.value;

  return (
    <UniversalModal
      show={$onboardingView.value.showUploadModal && Boolean(runId)}
      onHide={requestCloseUploadModal}
      closeButton
      headerText="Upload borrower folders"
      leftBtnText="Cancel"
      leftBtnOnClick={requestCloseUploadModal}
      leftButtonDisabled={isUploading}
      keyboard={!isUploading}
      backdrop={isUploading ? 'static' : true}
      rightBtnText={isUploading ? (
        <>
          <Spinner animation="border" size="sm" className="me-8 align-middle" role="status" aria-hidden />
          Uploading…
        </>
      ) : 'Upload to storage'}
      rightButtonDisabled={
        isUploading
        || !($onboardingUploadState.value.files?.length)
      }
      rightBtnOnClick={() => uploadFolderFiles(runId, $onboardingUploadState.value.files)}
      size="lg"
    >
      <div className="text-white mt-16">
        <p className="text-info-200 small mb-16">
          Choose one or more folders before uploading; paths are merged and preserved for classification and diff.
        </p>
        <FileUploader
          id={ONBOARDING_FOLDER_INPUT_ID}
          directory
          signal={$onboardingUploadState}
          name="files"
          variant="dropzone"
          dropzoneDark
        />
        <div className="d-flex justify-content-center mt-16">
          <Button
            variant="outline-primary-100"
            size="sm"
            disabled={isUploading}
            onClick={() => handleBrowse(ONBOARDING_FOLDER_INPUT_ID)}
          >
            Add another folder
          </Button>
        </div>
        {($onboardingUploadState.value.files?.length ?? 0) > 0 && (
          <p className="text-info-200 small mt-16 mb-0">
            {$onboardingUploadState.value.files.length}
            {' '}
            file(s) ready to upload
          </p>
        )}
        {isUploading && (
          <ProgressBar now={$onboardingUploadState.value.progress} className="mt-16" />
        )}
      </div>
    </UniversalModal>
  );
};

export default UploadFolderModal;
