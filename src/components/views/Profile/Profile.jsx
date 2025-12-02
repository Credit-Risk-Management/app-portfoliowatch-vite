import { Container, Row, Col, Card, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faBuilding, faShieldAlt, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '@src/components/global/PageHeader';
import { $user, $organization, $profileView, $profileForm } from '@src/signals';
import UniversalCard from '@src/components/global/UniversalCard';
import * as profileEvents from './_helpers/profile.events';
import * as consts from './_helpers/profile.consts';

const Profile = () => {
  const user = $user.value;
  const organization = $organization.value;
  const profileView = $profileView.value;
  const profileForm = $profileForm.value;

  const { isEditing } = profileView;
  const { isSaving } = profileView;

  return (
    <Container fluid className="py-24">
      <PageHeader title="My Profile" />

      <Row className="mt-24">
        <Col lg={8} xl={6} className="mx-auto">
          <UniversalCard headerText="Personal Information">
            <div className="d-flex justify-content-between align-items-center mb-24">
              {!isEditing && (
                <Button
                  variant="outline-primary-100"
                  size="sm"
                  onClick={profileEvents.startEditing}
                >
                  <FontAwesomeIcon icon={faEdit} className="me-8" />
                  Edit Profile
                </Button>
              )}
            </div>

            <Form>
              {/* Name Field */}
              <Form.Group className="mb-24">
                <Form.Label className="fw-semibold">
                  <FontAwesomeIcon icon={faUser} className="me-8 text-muted" />
                  Full Name
                </Form.Label>
                {isEditing ? (
                  <Form.Control
                    type="text"
                    placeholder="Enter your full name"
                    value={profileForm.name}
                    onChange={(e) => $profileForm.update({ name: e.target.value })}
                    disabled={isSaving}
                  />
                ) : (
                  <div className="form-control-plaintext fw-normal">{user.name || '-'}</div>
                )}
              </Form.Group>

              {/* Email Field (Read-only) */}
              <Form.Group className="mb-24">
                <Form.Label className="fw-semibold">
                  <FontAwesomeIcon icon={faEnvelope} className="me-8 text-muted" />
                  Email Address
                </Form.Label>
                <div className="form-control-plaintext fw-normal">{user.email || '-'}</div>
                <Form.Text className="text-muted">
                  Email is managed by your authentication provider and cannot be changed here.
                </Form.Text>
              </Form.Group>

              {/* Role Badge */}
              <Form.Group className="mb-24">
                <Form.Label className="fw-semibold">
                  <FontAwesomeIcon icon={faShieldAlt} className="me-8 text-muted" />
                  Role
                </Form.Label>
                <div>
                  <Badge bg={consts.ROLE_BADGE_VARIANTS[user.role] || 'secondary'}>
                    {consts.ROLE_LABELS[user.role] || user.role || 'User'}
                  </Badge>
                </div>
              </Form.Group>

              {/* Organization */}
              <Form.Group className="mb-24">
                <Form.Label className="fw-semibold">
                  <FontAwesomeIcon icon={faBuilding} className="me-8 text-muted" />
                  Organization
                </Form.Label>
                <div className="form-control-plaintext fw-normal">
                  {organization.name || '-'}
                </div>
                {organization.industry && (
                  <Form.Text className="text-muted">
                    Industry: {organization.industry}
                  </Form.Text>
                )}
              </Form.Group>

              {/* Action Buttons (shown when editing) */}
              {isEditing && (
                <div className="d-flex gap-8 mt-32">
                  <Button
                    variant="primary"
                    onClick={profileEvents.saveProfile}
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
                  <Button
                    variant="outline-secondary"
                    onClick={profileEvents.cancelEditing}
                    disabled={isSaving}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-8" />
                    Cancel
                  </Button>
                </div>
              )}
            </Form>
          </UniversalCard>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
