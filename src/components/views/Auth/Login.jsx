import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { loginUser } from '@src/utils/auth.utils';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import { $form } from '@src/signals';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  // Clear form on mount
  useEffect(() => {
    $form.update({ email: '', password: '' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { email, password } = $form.value;
    const result = await loginUser(email, password);

    if (result.success) {
      // Clear form and redirect to intended page or dashboard
      $form.update({ email: '', password: '' });
      navigate(redirect);
    } else {
      setError(result.error || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  // const handleGoogleLogin = async () => {
  //   setError('');
  //   setLoading(true);

  //   const result = await loginWithGoogle();

  //   if (result.success) {
  //     navigate(redirect);
  //   } else {
  //     setError(result.error || 'Google login failed. Please try again.');
  //     setLoading(false);
  //   }
  // };

  return (
    <Container className="pt-64">
      <Row className="w-100">
        <Col md={6} lg={5} xl={4} className="mx-auto">
          <Card className="border-info rounded">
            <Card.Body className="p-32 bg-gradient-secondary-primary-50">
              <div className="text-center mb-24">
                <img src="/logo_dark.svg" alt="Logo" className="mb-4" style={{ width: '300px' }} />
              </div>
              <div className="text-center mb-24">
                <h3 className="fw-bold">Login</h3>
                <p>Sign in to your account</p>
              </div>

              {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <UniversalInput
                    type="email"
                    name="email"
                    signal={$form}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                    className="bg-info-900"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <UniversalInput
                    type="password"
                    name="password"
                    signal={$form}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    className="bg-info-900"
                  />
                </Form.Group>
                <Button
                  variant="primary-900"
                  type="submit"
                  className="w-100 mt-16"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <div className="text-center mt-16">
                  <p className="text-muted mb-0">
                    Don&apos;t have an account?{' '}
                    <Link to="/signup" className="text-primary fw-semibold">
                      Sign up
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
