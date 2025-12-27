/* eslint-disable react/no-unescaped-entities */
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { useSignal } from '@fyclabs/tools-fyc-react/signals';
import { $global, $user } from '@src/signals';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import {
  $acceptInvitationView,
  $acceptInvitationForm,
} from './_helpers/acceptInvitation.consts';
import { fetchInvitation } from './_helpers/acceptInvitation.resolvers';
import {
  handleAcceptWithEmail,
  handleAcceptWithGoogle,
  handleAcceptSignedIn,
  clearError,
} from './_helpers/acceptInvitation.events';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  // Use signals for reactive state
  const viewState = useSignal($acceptInvitationView);
  const formData = useSignal($acceptInvitationForm);
  const { isSignedIn } = useSignal($global);
  const currentUser = useSignal($user);

  // Fetch invitation on mount
  useEffectAsync(async () => {
    await fetchInvitation(token);
  }, [token]);

  // Destructure view state for easier access
  const { invitation, isLoading, isAccepting, error } = viewState;

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
            <Card className="shadow">
              <Card.Body className="p-4">
                <Alert variant="danger">{error}</Alert>
                <div className="text-center">
                  <Link to="/login" className="btn btn-primary">
                    Go to Login
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center py-5">
      <Row className="w-100">
        <Col md={8} lg={6} xl={5} className="mx-auto">
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Accept Invitation</h2>
                <p className="text-muted">
                  You've been invited to join{' '}
                  <strong>{invitation?.organization?.name}</strong>
                </p>
              </div>

              {invitation && (
                <div className="mb-4">
                  <Alert variant="info">
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
                <>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAcceptWithEmail(token, navigate);
                    }}
                  >
                    <div className="mb-3">
                      <UniversalInput
                        label="Full Name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        name="name"
                        signal={$acceptInvitationForm}
                        required
                        disabled={isAccepting}
                      />
                    </div>

                    {!isSignedIn && (
                      <>
                        <div className="mb-3">
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
                          />
                          <div className="form-text">Must be at least 6 characters</div>
                        </div>

                        <div className="mb-3">
                          <UniversalInput
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            name="confirmPassword"
                            signal={$acceptInvitationForm}
                            required
                            disabled={isAccepting}
                          />
                        </div>
                      </>
                    )}

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mb-3"
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

                  {!isSignedIn && (
                    <>
                      <div className="text-center mb-3">
                        <span className="text-muted">or</span>
                      </div>
                      <Button
                        variant="outline-primary"
                        className="w-100"
                        onClick={() => handleAcceptWithGoogle(token, navigate)}
                        disabled={isAccepting}
                      >
                        {isAccepting ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Accepting...
                          </>
                        ) : (
                          'Accept with Google'
                        )}
                      </Button>
                    </>
                  )}
                </>
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
