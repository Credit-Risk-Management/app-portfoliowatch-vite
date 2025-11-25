import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { signupUser, signupWithGoogle } from '@src/utils/auth.utils';
import OrganizationForm from './_components/OrganizationForm';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // User form data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Organization form data
  const [organizationName, setOrganizationName] = useState('');
  const [industry, setIndustry] = useState('');

  const handleUserFormSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setStep(2);
  };

  const handleOrganizationFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signupUser(
      { name, email, password },
      { organizationName, industry }
    );

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!organizationName) {
      setError('Please enter your organization name');
      return;
    }

    setError('');
    setLoading(true);

    const result = await signupWithGoogle({ organizationName, industry });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Google signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center py-5">
      <Row className="w-100">
        <Col md={8} lg={6} xl={5} className="mx-auto">
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Create Your Account</h2>
                <p className="text-muted">
                  {step === 1
                    ? 'Get started with Portfolio Watch'
                    : 'Tell us about your organization'}
                </p>
              </div>

              {/* Progress indicator */}
              <div className="d-flex justify-content-center mb-4">
                <div className="d-flex align-items-center">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center ${
                      step >= 1 ? 'bg-primary text-white' : 'bg-secondary text-white'
                    }`}
                    style={{ width: '32px', height: '32px' }}
                  >
                    1
                  </div>
                  <div
                    className={`mx-2 ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`}
                    style={{ width: '40px', height: '2px' }}
                  />
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center ${
                      step >= 2 ? 'bg-primary text-white' : 'bg-secondary text-white'
                    }`}
                    style={{ width: '32px', height: '32px' }}
                  >
                    2
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                  {error}
                </Alert>
              )}

              {step === 1 && (
                <Form onSubmit={handleUserFormSubmit}>
                  <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <Form.Text className="text-muted">
                      Must be at least 6 characters
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="confirmPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    Continue
                  </Button>

                  <div className="text-center">
                    <p className="text-muted mb-0">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary fw-semibold">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </Form>
              )}

              {step === 2 && (
                <OrganizationForm
                  organizationName={organizationName}
                  setOrganizationName={setOrganizationName}
                  industry={industry}
                  setIndustry={setIndustry}
                  loading={loading}
                  onSubmit={handleOrganizationFormSubmit}
                  onBack={() => setStep(1)}
                  onGoogleSignup={handleGoogleSignup}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;

