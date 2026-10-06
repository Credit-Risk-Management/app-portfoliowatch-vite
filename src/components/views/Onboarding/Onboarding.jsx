import { Badge, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import PageHeader from '@src/components/global/PageHeader';
import SignalTable from '@src/components/global/SignalTable';
import {
  $onboardingRuns,
  $onboardingSelectedTenant,
  $onboardingView,
  RUN_TABLE_HEADERS,
} from './_helpers/onboarding.consts';
import { fetchRuns, fetchTenants } from './_helpers/onboarding.resolvers';
import { openCreateModal } from './_helpers/onboarding.events';
import CreateOnboardingRunModal from './_components/CreateOnboardingRunModal';

const Onboarding = () => {
  const navigate = useNavigate();

  useEffectAsync(async () => {
    await fetchTenants();
    if ($onboardingSelectedTenant.value.orgDb) {
      await fetchRuns();
    }
  }, []);

  const rows = ($onboardingRuns.value.list || []).map(run => ({
    name: run.name,
    status: () => <Badge bg="secondary">{run.status}</Badge>,
    totalItems: run.totalItems,
    matchedItems: run.matchedItems,
    importedItems: run.importedItems,
    actions: () => (
      <button
        type="button"
        className="btn btn-sm btn-outline-primary-100"
        onClick={e => {
          e.stopPropagation();
          navigate(`/onboarding/${run.id}`);
        }}
      >
        Open
      </button>
    ),
  }));

  return (
    <Container className="py-16 py-md-24">
      <PageHeader
        title="Borrower onboarding"
        actionButton
        actionButtonText="New run"
        actionButtonIcon={faPlus}
        onActionClick={openCreateModal}
      />
      <p className="text-info-200 small mb-16">
        Tenant:
        {' '}
        {$onboardingSelectedTenant.value.displayName || 'Select when creating a run'}
      </p>
      <SignalTable
        $view={$onboardingView}
        headers={RUN_TABLE_HEADERS}
        rows={rows}
        hasPagination={false}
        onRowClick={row => {
          const run = ($onboardingRuns.value.list || []).find(r => r.name === row.name);
          if (run) navigate(`/onboarding/${run.id}`);
        }}
      />
      <CreateOnboardingRunModal />
    </Container>
  );
};

export default Onboarding;
