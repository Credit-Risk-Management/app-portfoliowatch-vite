import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import PageHeader from '@src/components/global/PageHeader';
import { $user } from '@src/signals';
import UsersInvitationsTab from '@src/components/views/Settings/_components/UsersInvitationsTab';
import InviteUserModal from '@src/components/views/Settings/_components/InviteUserModal';

const UsersSettings = () => {
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
    <>
      <Container className="py-24">
        <PageHeader title="Users & Invitations" />
        <div className="mt-24">
          <UsersInvitationsTab />
        </div>
      </Container>
      <InviteUserModal />
    </>
  );
};

export default UsersSettings;
