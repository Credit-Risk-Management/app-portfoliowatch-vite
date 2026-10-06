import { Badge, Button, Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import PageHeader from '@src/components/global/PageHeader';
import SignalTable from '@src/components/global/SignalTable';
import {
  $onboardingRunDetail,
  $onboardingView,
  ITEM_TABLE_HEADERS,
  MATCH_STATUS_BADGE,
} from './_helpers/onboarding.consts';
import { fetchRunDetail } from './_helpers/onboarding.resolvers';
import {
  handleStartDiff,
  handleStartImport,
  openMatchModal,
  openUploadModal,
} from './_helpers/onboarding.events';
import UploadFolderModal from './_components/UploadFolderModal';
import MatchRelationshipModal from './_components/MatchRelationshipModal';

const OnboardingRunDetail = () => {
  const { runId } = useParams();

  const RunDetailActions = () => (
    <div className="d-flex flex-wrap gap-8">
      <Button variant="outline-primary-100" size="sm" onClick={() => openUploadModal(runId)}>
        Upload folders
      </Button>
      <Button variant="outline-primary-100" size="sm" onClick={() => handleStartDiff(runId)}>
        Diff & classify
      </Button>
      <Button variant="outline-primary-100" size="sm" onClick={() => handleStartImport(runId)}>
        Import
      </Button>
    </div>
  );

  useEffectAsync(async () => {
    if (runId) await fetchRunDetail(runId);
  }, [runId]);

  const { run } = $onboardingRunDetail.value;
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
      <UploadFolderModal />
      <MatchRelationshipModal />
    </Container>
  );
};

export default OnboardingRunDetail;
