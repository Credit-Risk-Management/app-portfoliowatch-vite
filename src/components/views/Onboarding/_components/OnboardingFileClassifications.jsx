import {
  $onboardingFileFilter,
  $onboardingFileView,
  $onboardingFiles,
} from '../_helpers/onboarding.consts';
import OnboardingFileClassificationsTable from './OnboardingFileClassificationsTable';

const OnboardingFileClassifications = () => {
  const files = $onboardingFiles.value.list || [];

  return (
    <section className="mt-24">
      <h2 className="h5 text-light mb-8">File classifications</h2>
      <OnboardingFileClassificationsTable
        files={files}
        $filter={$onboardingFileFilter}
        $selectionView={$onboardingFileView}
        showFolderColumn
        showScanControls
        scanAllOmitsFileIds
      />
    </section>
  );
};

export default OnboardingFileClassifications;
