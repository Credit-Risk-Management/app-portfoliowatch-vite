/* eslint-disable react/no-unescaped-entities */
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Alert, Button, Spinner, Card } from 'react-bootstrap';
import { $global, $user } from '@src/signals';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import UniversalCard from '@src/components/global/UniversalCard';
import {
  $acceptInvitationView,
  $acceptInvitationForm,
} from './_helpers/acceptInvitation.consts';
import { fetchInvitation } from './_helpers/acceptInvitation.resolvers';
import {
  handleAcceptWithEmail,
  handleAcceptSignedIn,
  clearError,
} from './_helpers/acceptInvitation.events';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  // Fetch invitation on mount
  useEffectAsync(async () => {
    await fetchInvitation(token);
  }, [token]);

  // Destructure signals for easier access
  const { invitation, isLoading, isAccepting, error } = $acceptInvitationView.value;
  const formData = $acceptInvitationForm.value;
  const { isSignedIn } = $global.value;
  const currentUser = $user.value;

  if (isLoading) {
    return (
      <Container className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error && !invitation) {
    return (
      <Container className="min-vh-100 d-flex align-items-center justify-content-center py-5">
        <Row className="w-100">
          <Col md={8} lg={6} xl={5} className="mx-auto">
            <UniversalCard>
              <Alert variant="danger">{error}</Alert>
              <div className="text-center">
                <Link to="/login" className="btn btn-primary">
                  Go to Login
                </Link>
              </div>
            </UniversalCard>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center py-5">
      <Row className="w-100">
        <Col md={8} lg={6} xl={5} className="mx-auto">
          <Card className="border-info rounded">
            <Card.Body className="p-32 bg-gradient-secondary-primary-50">
              <div className="text-center mb-4">
                <img src="/logo_dark.svg" alt="Logo" className="mb-4" style={{ width: '300px' }} />
                <hr />
                <h3>Accept Invitation</h3>
                <p className="text-dark lead">
                  You've been invited to join{' '}
                  <strong>{invitation?.organization?.name}</strong>
                </p>
              </div>

              {invitation && (
                <div className="mb-4">
                  <Alert variant="warning">
                    <strong>Role:</strong> {invitation.role === 'ADMIN' ? 'Admin' : 'Basic User'}
                    <br />
                    <strong>Email:</strong> {invitation.email}
                  </Alert>
                </div>
              )}

              {error && (
                <Alert variant="danger" onClose={clearError} dismissible>
                  {error}
                </Alert>
              )}

              {isSignedIn && currentUser?.email === invitation?.email ? (
                <div>
                  <p>You're already signed in. Click below to accept the invitation.</p>
                  <Button
                    variant="primary"
                    className="w-100 mb-3"
                    onClick={() => handleAcceptSignedIn(token, navigate)}
                    disabled={isAccepting}
                  >
                    {isAccepting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Accepting...
                      </>
                    ) : (
                      'Accept Invitation'
                    )}
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAcceptWithEmail(token, navigate);
                  }}
                >
                  <div className="mb-8">
                    <UniversalInput
                      label="First Name"
                      type="text"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      name="firstName"
                      signal={$acceptInvitationForm}
                      required
                      disabled={isAccepting}
                      className="bg-info-900"
                    />
                  </div>

                  <div className="mb-8">
                    <UniversalInput
                      label="Last Name"
                      type="text"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      name="lastName"
                      signal={$acceptInvitationForm}
                      required
                      disabled={isAccepting}
                      className="bg-info-900"
                    />
                  </div>

                  {!isSignedIn && (
                    <>
                      <div className="mb-8">
                        <UniversalInput
                          label="Password"
                          type="password"
                          placeholder="Create a password"
                          value={formData.password}
                          name="password"
                          signal={$acceptInvitationForm}
                          required
                          disabled={isAccepting}
                          minLength={6}
                          className="bg-info-900"
                        />
                        <div className="form-text">Must be at least 6 characters</div>
                      </div>

                      <div className="mb-8">
                        <UniversalInput
                          label="Confirm Password"
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          name="confirmPassword"
                          signal={$acceptInvitationForm}
                          required
                          disabled={isAccepting}
                          className="bg-info-900"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    variant="primary-900"
                    type="submit"
                    className="w-100 my-16"
                    disabled={isAccepting}
                  >
                    {isAccepting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Accepting...
                      </>
                    ) : (
                      'Accept Invitation'
                    )}
                  </Button>
                </form>
              )}

              <div className="text-center mt-4">
                <p className="text-muted mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary fw-semibold">
                    Sign in
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AcceptInvitation;
