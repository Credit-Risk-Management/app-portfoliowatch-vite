import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { useEffect } from 'react';
import PageHeader from '@src/components/global/PageHeader';
import { $user, $organization, $profileView, $profileForm } from '@src/signals';
import UniversalCard from '@src/components/global/UniversalCard';
import * as profileEvents from './_helpers/profile.events';

const Profile = () => {
  const user = $user.value;
  const organization = $organization.value;
  const profileView = $profileView.value;
  const profileForm = $profileForm.value;

  const { isSaving } = profileView;

  // Initialize form with user data when component mounts or user.name changes
  useEffect(() => {
    if (user.name) {
      $profileForm.update({ name: user.name });
    }
  }, [user.name]);

  return (
    <Container className="py-16 py-md-24">
      <PageHeader title="My Profile" />

      <Row>
        <Col className="col-8 offset-2">
          <UniversalCard headerText="Personal Information">
            <Form>
              {/* Name Field */}
              <Form.Group className="my-16">
                <Form.Label className="fw-semibold">
                  Full Name
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your full name"
                  value={profileForm.name}
                  onChange={(e) => $profileForm.update({ name: e.target.value })}
                  disabled={isSaving}
                  className="bg-info-700 border-0 text-info-100"
                />
              </Form.Group>

              <Row>
                {/* Email Field (Read-only) */}
                <Col md={4} className="mb-16">
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Email Address
                    </Form.Label>
                    <div className="fw-normal">{user.email || '-'}</div>
                  </Form.Group>
                </Col>

                {/* Role Badge */}
                <Col md={4} className="mb-16">
                  <Form.Label className="fw-semibold">
                    Role
                  </Form.Label>
                  <div>
                    {user.role === 'ADMIN' ? 'Administrator' : 'User'}
                  </div>
                </Col>

                {/* Organization */}
                <Col md={4} className="mb-16">
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Organization
                    </Form.Label>
                    <div className="fw-normal">
                      {organization.name || '-'}
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Action Button */}
              <div className="">
                <Button
                  variant="success-300"
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
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </UniversalCard>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
