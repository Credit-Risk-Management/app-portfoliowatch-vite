import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { $global, $user } from '@src/signals';
import * as invitationApi from '@src/api/invitation.api';
import { createUserWithEmailAndPassword, signInWithGoogle, signInWithEmailAndPassword } from '@src/utils/firebase';
import { getCurrentToken } from '@src/utils/auth.utils';
import { auth } from '@src/utils/firebase';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isSignedIn = $global.value.isSignedIn;
  const currentUser = $user.value;

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. No token provided.');
      setLoading(false);
      return;
    }

    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      setLoading(true);
      const response = await invitationApi.getInvitationByToken(token);
      setInvitation(response.data);
      
      // If user is signed in and email matches, pre-fill name
      if (isSignedIn && currentUser?.email === response.data.email) {
        setName(currentUser.name || '');
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load invitation';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptWithEmail = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setAccepting(true);

    try {
      let firebaseUid;

      if (isSignedIn && currentUser?.email === invitation.email) {
        // User is already signed in with matching email
        firebaseUid = auth.currentUser?.uid;
        if (!firebaseUid) {
          throw new Error('User not authenticated');
        }
      } else {
        // Try to create Firebase account (will fail if user already exists)
        try {
          const firebaseUser = await createUserWithEmailAndPassword(
            invitation.email,
            password
          );
          firebaseUid = firebaseUser.uid;
        } catch (createError) {
          // If user already exists, try to sign in
          if (createError.code === 'auth/email-already-in-use') {
            const firebaseUser = await signInWithEmailAndPassword(
              invitation.email,
              password
            );
            firebaseUid = firebaseUser.uid;
          } else {
            throw createError;
          }
        }
      }

      // Accept invitation
      await invitationApi.acceptInvitation(token, firebaseUid, name);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to accept invitation';
      setError(errorMessage);
      setAccepting(false);
    }
  };

  const handleAcceptWithGoogle = async () => {
    setError('');
    setAccepting(true);

    try {
      const firebaseUser = await signInWithGoogle();
      
      // Verify email matches invitation
      if (firebaseUser.email !== invitation.email) {
        setError('Google account email does not match invitation email');
        setAccepting(false);
        return;
      }

      // Accept invitation
      await invitationApi.acceptInvitation(
        token,
        firebaseUser.uid,
        firebaseUser.displayName || firebaseUser.email
      );

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to accept invitation';
      setError(errorMessage);
      setAccepting(false);
    }
  };

  if (loading) {
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
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                  {error}
                </Alert>
              )}

              {isSignedIn && currentUser?.email === invitation?.email ? (
                <div>
                  <p>You're already signed in. Click below to accept the invitation.</p>
                  <Button
                    variant="primary"
                    className="w-100 mb-3"
                    onClick={async () => {
                      setAccepting(true);
                      try {
                        const firebaseUid = auth.currentUser?.uid;
                        if (!firebaseUid) {
                          throw new Error('User not authenticated');
                        }
                        await invitationApi.acceptInvitation(
                          token,
                          firebaseUid,
                          currentUser.name || name || currentUser.email
                        );
                        navigate('/dashboard');
                      } catch (err) {
                        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to accept invitation';
                        setError(errorMessage);
                        setAccepting(false);
                      }
                    }}
                    disabled={accepting}
                  >
                    {accepting ? (
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
                  <form onSubmit={handleAcceptWithEmail}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={accepting}
                      />
                    </div>

                    {!isSignedIn && (
                      <>
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">
                            Password
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={accepting}
                            minLength={6}
                          />
                          <div className="form-text">Must be at least 6 characters</div>
                        </div>

                        <div className="mb-3">
                          <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={accepting}
                          />
                        </div>
                      </>
                    )}

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mb-3"
                      disabled={accepting}
                    >
                      {accepting ? (
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
                        onClick={handleAcceptWithGoogle}
                        disabled={accepting}
                      >
                        {accepting ? (
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

