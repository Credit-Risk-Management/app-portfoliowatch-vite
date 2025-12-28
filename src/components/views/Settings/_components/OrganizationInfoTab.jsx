import { useEffect } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBuilding, faIndustry } from '@fortawesome/free-solid-svg-icons';
import { $organization, $settingsView, $settingsForm, $user } from '@src/signals';
import UniversalCard from '@src/components/global/UniversalCard';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import * as settingsEvents from '../_helpers/settings.events';

const OrganizationInfoTab = () => {
  const organization = $organization.value;
  const settingsView = $settingsView.value;
  const user = $user.value;

  const { isSaving } = settingsView;
  const isAdmin = user.role === 'ADMIN';

  useEffect(() => {
    settingsEvents.loadOrganizationData();
  }, []);

  if (!isAdmin) {
    return (
      <UniversalCard headerText="Organization Information">
        <Alert variant="info">
          <strong>View Only:</strong> Only administrators can edit organization settings.
        </Alert>
        <div className="mt-24">
          <h5 className="mb-16">
            <FontAwesomeIcon icon={faBuilding} className="me-8 text-primary" />
            {organization.name}
          </h5>
          {organization.industry && (
            <p className="text-muted mb-0">
              <FontAwesomeIcon icon={faIndustry} className="me-8" />
              Industry: {organization.industry}
            </p>
          )}
        </div>
      </UniversalCard>
    );
  }

  return (
    <UniversalCard headerText="Organization Information">
      <Form>
        <div className="mt-8 mb-24">
          <UniversalInput
            label="Organization Name"
            type="text"
            name="organizationName"
            signal={$settingsForm}
            placeholder="Enter organization name"
            disabled={isSaving}
            className="bg-info-900"
          />
        </div>
        <Button
          variant="success-300"
          onClick={settingsEvents.saveOrganization}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Spinner animation="border" size="sm" className="me-8" />
              Saving...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} className="me-8" />
              Save Changes
            </>
          )}
        </Button>
      </Form>
    </UniversalCard>
  );
};

export default OrganizationInfoTab;
