export const getRoleLabel = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'Admin';
    case 'USER':
      return 'Basic User';
    default:
      return role;
  }
};

export const getInvitationStatus = (invitation) => {
  if (invitation.acceptedAt) {
    return { label: 'Accepted', variant: 'success' };
  }

  const expiresAt = new Date(invitation.expiresAt);
  const now = new Date();

  if (now > expiresAt) {
    return { label: 'Expired', variant: 'secondary' };
  }

  return { label: 'Pending', variant: 'warning' };
};

export { formatDate } from '@src/utils/formatDate';
