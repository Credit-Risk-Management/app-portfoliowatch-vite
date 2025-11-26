import { useEffect } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBuilding, faIndustry } from '@fortawesome/free-solid-svg-icons';
import { $organization, $settingsView, $settingsForm, $user } from '@src/signals';
import * as settingsEvents from '../_helpers/settings.events';

const OrganizationInfoTab = () => {
  const organization = $organization.value;
  const settingsView = $settingsView.value;
  const settingsForm = $settingsForm.value;
  const user = $user.value;

  const isSaving = settingsView.isSaving;
  const isAdmin = user.role === 'ADMIN';

  useEffect(() => {
    settingsEvents.loadOrganizationData();
  }, []);

  if (!isAdmin) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="p-32">
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
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Body className="p-32">
        <h5 className="mb-24">
          <FontAwesomeIcon icon={faBuilding} className="me-8 text-primary" />
          Organization Information
        </h5>

        <Form>
          <Form.Group className="mb-24">
            <Form.Label className="fw-semibold">
              Organization Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter organization name"
              value={settingsForm.organizationName}
              onChange={(e) => $settingsForm.update({ organizationName: e.target.value })}
              disabled={isSaving}
            />
          </Form.Group>

          <Form.Group className="mb-32">
            <Form.Label className="fw-semibold">Industry</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Banking, Healthcare, Technology"
              value={settingsForm.organizationIndustry}
              onChange={(e) => $settingsForm.update({ organizationIndustry: e.target.value })}
              disabled={isSaving}
            />
            <Form.Text className="text-muted">
              Optional: Specify your organization's primary industry
            </Form.Text>
          </Form.Group>

          <Button
            variant="primary"
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
      </Card.Body>
    </Card>
  );
};

export default OrganizationInfoTab;

