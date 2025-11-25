import { Form, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const OrganizationForm = ({
  organizationName,
  setOrganizationName,
  industry,
  setIndustry,
  loading,
  onSubmit,
  onBack,
  onGoogleSignup,
}) => {
  const industries = [
    { value: '', label: 'Select an industry' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Financial Services', label: 'Financial Services' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Energy', label: 'Energy' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Education', label: 'Education' },
    { value: 'Professional Services', label: 'Professional Services' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <Form onSubmit={onSubmit}>
      <Form.Group className="mb-3" controlId="organizationName">
        <Form.Label>Organization Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter your organization name"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          required
          disabled={loading}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="industry">
        <Form.Label>Industry</Form.Label>
        <Form.Select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          disabled={loading}
        >
          {industries.map((ind) => (
            <option key={ind.value} value={ind.value}>
              {ind.label}
            </option>
          ))}
        </Form.Select>
        <Form.Text className="text-muted">
          This helps us customize your experience
        </Form.Text>
      </Form.Group>

      <Button
        variant="primary"
        type="submit"
        className="w-100 mb-3"
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>

      <div className="text-center mb-3">
        <span className="text-muted">or</span>
      </div>

      <Button
        variant="outline-secondary"
        className="w-100 mb-3"
        onClick={onGoogleSignup}
        disabled={loading || !organizationName}
      >
        <i className="bi bi-google me-2" />
        Continue with Google
      </Button>

      <Button
        variant="outline-secondary"
        className="w-100"
        onClick={onBack}
        disabled={loading}
      >
        Back
      </Button>
    </Form>
  );
};

OrganizationForm.propTypes = {
  organizationName: PropTypes.string.isRequired,
  setOrganizationName: PropTypes.func.isRequired,
  industry: PropTypes.string.isRequired,
  setIndustry: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onGoogleSignup: PropTypes.func.isRequired,
};

export default OrganizationForm;

