import { Form, Row, Col } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import {
  $onboardingCreateForm,
  $onboardingTenants,
  $onboardingTenantPick,
  $onboardingView,
} from '../_helpers/onboarding.consts';
import { closeCreateModal, handleCreateRun } from '../_helpers/onboarding.events';
import { applySelectedTenant } from '../_helpers/onboarding.resolvers';

const CreateOnboardingRunModal = () => {
  const tenantOptions = [
    { value: '', label: 'Select tenant…' },
    ...($onboardingTenants.value || []).map(t => ({
      value: t.orgDb,
      label: t.displayName,
    })),
  ];

  return (
    <UniversalModal
      show={$onboardingView.value.showCreateModal}
      onHide={closeCreateModal}
      closeButton
      headerText="New onboarding run"
      leftBtnText="Cancel"
      rightBtnText="Create run"
      rightBtnOnClick={handleCreateRun}
      size="lg"
    >
      <Form className="text-white align-items-start mt-16">
        <Row>
          <Col md={12} className="mb-16">
            <Form.Label className="text-light">Tenant</Form.Label>
            <SelectInput
              name="orgDb"
              signal={$onboardingTenantPick}
              options={tenantOptions}
              value={$onboardingTenantPick.value.orgDb}
              notClearable
              onChange={(selected) => {
                const tenant = ($onboardingTenants.value || []).find(
                  t => t.orgDb === selected?.value,
                );
                if (tenant) {
                  applySelectedTenant(tenant);
                }
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col md={12} className="mb-16">
            <UniversalInput
              label="Run name"
              signal={$onboardingCreateForm}
              name="name"
              placeholder="e.g. First Alliance Q1 2026"
            />
          </Col>
        </Row>
        <Row>
          <Col md={12} className="mb-16">
            <UniversalInput
              label="Dropbox folder name (reference)"
              signal={$onboardingCreateForm}
              name="dropboxFolderName"
              placeholder="Folder name in Dropbox"
            />
          </Col>
        </Row>
        <Row>
          <Col md={12} className="mb-16">
            <Form.Label className="text-light">Master list CSV</Form.Label>
            <Form.Control
              type="file"
              accept=".csv,text/csv"
              className="bg-info-800 border-0 text-info-100"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                $onboardingCreateForm.update({ masterListFile: file });
              }}
            />
          </Col>
        </Row>
      </Form>
    </UniversalModal>
  );
};

export default CreateOnboardingRunModal;
