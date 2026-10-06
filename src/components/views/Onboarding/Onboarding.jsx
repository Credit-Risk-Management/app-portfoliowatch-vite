import { Badge, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import PageHeader from '@src/components/global/PageHeader';
import SignalTable from '@src/components/global/SignalTable';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import {
  $onboardingRuns,
  $onboardingSelectedTenant,
  $onboardingTenants,
  $onboardingTenantPick,
  $onboardingView,
  RUN_TABLE_HEADERS,
} from './_helpers/onboarding.consts';
import { fetchRuns, fetchTenants } from './_helpers/onboarding.resolvers';
import { handleTenantChange, openCreateModal } from './_helpers/onboarding.events';
import CreateOnboardingRunModal from './_components/CreateOnboardingRunModal';

const Onboarding = () => {
  const navigate = useNavigate();

  useEffectAsync(async () => {
    await fetchTenants();
    if ($onboardingSelectedTenant.value.orgDb) {
      await fetchRuns();
    }
  }, []);

  const tenantOptions = [
    { value: '', label: 'Select tenant…' },
    ...($onboardingTenants.value || []).map(t => ({
      value: t.orgDb,
      label: t.displayName,
    })),
  ];

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
      <Row className="mb-16 align-items-end">
        <Col xs={12} md={6} lg={4}>
          <Form.Label className="text-light mb-8">Tenant</Form.Label>
          <SelectInput
            name="orgDb"
            signal={$onboardingTenantPick}
            options={tenantOptions}
            value={$onboardingTenantPick.value.orgDb}
            notClearable
            onChange={handleTenantChange}
          />
        </Col>
      </Row>
      {!$onboardingSelectedTenant.value.orgDb && (
        <p className="text-info-200 small mb-16">
          Choose a tenant to load runs and create imports.
        </p>
      )}
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
