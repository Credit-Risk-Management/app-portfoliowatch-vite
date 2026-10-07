import UniversalModal from '@src/components/global/UniversalModal';
import {
  $onboardingFiles,
  $onboardingFolderFileFilter,
  $onboardingFolderFileView,
  $onboardingRunDetail,
  $onboardingView,
} from '../_helpers/onboarding.consts';
import { closeFolderFilesModal } from '../_helpers/onboarding.events';
import { filesForFolderPath, filesForTaskScan } from '../_helpers/onboarding.helpers';
import OnboardingFileClassificationsTable from './OnboardingFileClassificationsTable';

const FolderClassificationsModal = () => {
  const itemId = $onboardingView.value.folderFilesItemId;
  const folderPath = $onboardingView.value.folderFilesPath;
  const item = ($onboardingRunDetail.value.items || []).find((row) => row.id === itemId);
  const folderFiles = filesForTaskScan(
    filesForFolderPath($onboardingFiles.value.list || [], folderPath),
  );

  const headerParts = [
    item?.borrowerName || 'Borrower',
    item?.loanNumber || null,
    folderPath || null,
  ].filter(Boolean);

  return (
    <UniversalModal
      show={$onboardingView.value.showFolderFilesModal && Boolean(folderPath)}
      onHide={closeFolderFilesModal}
      closeButton
      headerText="Folder classifications"
      leftBtnText="Close"
      leftBtnOnClick={closeFolderFilesModal}
      size="fullscreen"
    >
      <p className="text-info-200 small mb-16">{headerParts.join(' · ')}</p>
      <OnboardingFileClassificationsTable
        files={folderFiles}
        $filter={$onboardingFolderFileFilter}
        $selectionView={$onboardingFolderFileView}
        showFolderColumn={false}
        showScanControls
        scanAllOmitsFileIds={false}
        emptyMessage="No files in this folder."
      />
    </UniversalModal>
  );
};

export default FolderClassificationsModal;
