import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import PageHeader from '@src/components/global/PageHeader';
import { $user } from '@src/signals';
import OrganizationInfoTab from '@src/components/views/Settings/_components/OrganizationInfoTab';

const OrganizationSettings = () => {
  const navigate = useNavigate();
  const isAdmin = $user.value.role === 'ADMIN';

  useEffect(() => {
    // Redirect non-admin users to dashboard
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  return (
    <Container className="py-24">
      <PageHeader title="Organization Settings" />
      <div className="mt-24">
        <OrganizationInfoTab />
      </div>
    </Container>
  );
};

export default OrganizationSettings;
