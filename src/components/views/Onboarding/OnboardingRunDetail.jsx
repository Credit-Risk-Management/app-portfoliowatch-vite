import { useEffect } from 'react';
import { Badge, Button, Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import PageHeader from '@src/components/global/PageHeader';
import SignalTable from '@src/components/global/SignalTable';
import {
  $onboardingDiff,
  $onboardingRunDetail,
  $onboardingView,
  ITEM_TABLE_HEADERS,
  MATCH_STATUS_BADGE,
} from './_helpers/onboarding.consts';
import { fetchRunDetail, fetchTenants } from './_helpers/onboarding.resolvers';
import {
  clearOnboardingDiffPoll,
  handleStartDiff,
  handleStartImport,
  openMatchModal,
  openUploadModal,
  resetOnboardingFileReview,
  resumeDiffPollingIfNeeded,
} from './_helpers/onboarding.events';
import {
  onboardingDiffButtonLabel,
  onboardingDiffStatusMessage,
} from './_helpers/onboarding.helpers';
import UploadFolderModal from './_components/UploadFolderModal';
import MatchRelationshipModal from './_components/MatchRelationshipModal';
import OnboardingFileClassifications from './_components/OnboardingFileClassifications';

const OnboardingRunDetail = () => {
  const { runId } = useParams();

  useEffect(() => {
    resetOnboardingFileReview();
    $onboardingDiff.update({ activeRunId: runId || null });
    return () => {
      clearOnboardingDiffPoll();
      $onboardingDiff.update({ activeRunId: null });
    };
  }, [runId]);

  useEffectAsync(async () => {
    await fetchTenants();
    if (runId) {
      await fetchRunDetail(runId);
      resumeDiffPollingIfNeeded(runId);
    }
  }, [runId]);

  const { run } = $onboardingRunDetail.value;
  const diffBusy = $onboardingDiff.value.isInFlight
    || run?.status === 'DIFFING'
    || run?.status === 'CLASSIFYING';

  const RunDetailActions = () => (
    <div className="d-flex flex-wrap gap-8">
      <Button variant="outline-primary-100" size="sm" onClick={() => openUploadModal(runId)}>
        Upload folders
      </Button>
      <Button
        variant="outline-primary-100"
        size="sm"
        disabled={diffBusy}
        onClick={() => handleStartDiff(runId)}
      >
        {onboardingDiffButtonLabel(run?.status, diffBusy)}
      </Button>
      <Button
        variant="outline-primary-100"
        size="sm"
        disabled={diffBusy}
        onClick={() => handleStartImport(runId)}
      >
        Import
      </Button>
    </div>
  );
  const items = $onboardingRunDetail.value.items || [];

  const rows = items.map(item => ({
    borrowerName: item.borrowerName,
    loanNumber: item.loanNumber || '—',
    folderPath: item.folderPath || '—',
    matchStatus: () => (
      <Badge bg={MATCH_STATUS_BADGE[item.matchStatus] || 'secondary'}>{item.matchStatus}</Badge>
    ),
    importStatus: () => (
      <Badge bg={item.importStatus === 'COMPLETED' ? 'success' : 'secondary'}>{item.importStatus}</Badge>
    ),
    actions: () => (
      <button
        type="button"
        className="btn btn-sm btn-outline-primary-100"
        onClick={e => {
          e.stopPropagation();
          openMatchModal(item.id);
        }}
      >
        Match
      </button>
    ),
  }));

  return (
    <Container className="py-16 py-md-24">
      <PageHeader
        title={run?.name || 'Onboarding run'}
        breadcrumbs={[
          { href: '/onboarding', label: 'Onboarding' },
          { label: run?.name || 'Run' },
        ]}
        AdditionalComponents={RunDetailActions}
      />
      <div className="d-flex flex-wrap align-items-center gap-8 mb-16">
        <Badge bg="secondary">{run?.status}</Badge>
        {diffBusy && (
          <span className="text-info-200 small">{onboardingDiffStatusMessage(run?.status)}</span>
        )}
        {run?.dropboxFolderName && (
          <span className="text-info-200 small">
            Dropbox ref:
            {' '}
            {run.dropboxFolderName}
          </span>
        )}
      </div>
      <SignalTable
        $view={$onboardingView}
        headers={ITEM_TABLE_HEADERS}
        rows={rows}
        hasPagination={false}
      />
      <OnboardingFileClassifications />
      <UploadFolderModal />
      <MatchRelationshipModal />
    </Container>
  );
};

export default OnboardingRunDetail;
