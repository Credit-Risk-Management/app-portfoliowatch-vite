import { $users, $usersView, $usersForm, $user, $organization, $alert } from '@src/signals';
import * as invitationApi from '@src/api/invitation.api';
import * as organizationApi from '@src/api/organization.api';

export const fetchUsers = async () => {
  try {
    $users.update({ isLoading: true });

    const organizationId = $user.value?.organizationId || $organization.value?.id;
    if (!organizationId) {
      $users.update({ isLoading: false });
      return;
    }

    // Fetch organization members
    const membersResponse = await organizationApi.getOrganizationMembers(organizationId);
    const members = membersResponse.data || [];

    // Fetch invitations
    const invitationsResponse = await invitationApi.getInvitations(organizationId);
    const invitations = invitationsResponse.data || [];

    $users.update({
      list: members,
      invitations,
      isLoading: false,
      totalCount: members.length,
    });
  } catch (error) {
    $users.update({ isLoading: false });
    console.error('Error fetching users:', error);
  }
};

export const handleInviteUser = async () => {
  try {
    const formData = $usersForm.value;
    const organizationId = $user.value?.organizationId || $organization.value?.id;

    if (!organizationId) {
      $alert.update({
        show: true,
        variant: 'danger',
        message: 'Organization not found',
      });
      return;
    }

    if (!formData.email) {
      $alert.update({
        show: true,
        variant: 'danger',
        message: 'Email is required',
      });
      return;
    }

    await invitationApi.createInvitation(
      organizationId,
      formData.email,
      formData.role || 'USER',
      formData.message || undefined,
    );

    // Refresh invitations list
    await fetchUsers();

    // Close modal and reset form
    $usersView.update({ showInviteModal: false });
    $usersForm.reset();

    $alert.update({
      show: true,
      variant: 'success',
      message: 'Invitation sent successfully',
    });
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send invitation';
    $alert.update({
      show: true,
      variant: 'danger',
      message: errorMessage,
    });
  }
};

export const handleResendInvitation = async (invitationId) => {
  try {
    await invitationApi.resendInvitation(invitationId);
    await fetchUsers();

    $alert.update({
      show: true,
      variant: 'success',
      message: 'Invitation resent successfully',
    });
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to resend invitation';
    $alert.update({
      show: true,
      variant: 'danger',
      message: errorMessage,
    });
  }
};

export const handleRevokeInvitation = async (invitationId) => {
  try {
    await invitationApi.revokeInvitation(invitationId);
    await fetchUsers();

    $alert.update({
      show: true,
      variant: 'success',
      message: 'Invitation revoked successfully',
    });
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to revoke invitation';
    $alert.update({
      show: true,
      variant: 'danger',
      message: errorMessage,
    });
  }
};

export const handleSuspendUser = async (userId) => {
  try {
    const organizationId = $user.value?.organizationId || $organization.value?.id;
    if (!organizationId) {
      throw new Error('Organization not found');
    }

    await organizationApi.suspendMember(organizationId, userId);
    await fetchUsers();

    $alert.update({
      show: true,
      variant: 'success',
      message: 'User suspended successfully',
    });
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to suspend user';
    $alert.update({
      show: true,
      variant: 'danger',
      message: errorMessage,
    });
  }
};

export const handleUnsuspendUser = async (userId) => {
  try {
    const organizationId = $user.value?.organizationId || $organization.value?.id;
    if (!organizationId) {
      throw new Error('Organization not found');
    }

    await organizationApi.unsuspendMember(organizationId, userId);
    await fetchUsers();

    $alert.update({
      show: true,
      variant: 'success',
      message: 'User unsuspended successfully',
    });
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to unsuspend user';
    $alert.update({
      show: true,
      variant: 'danger',
      message: errorMessage,
    });
  }
};

export const handleDeleteUser = async (userId) => {
  try {
    const organizationId = $user.value?.organizationId || $organization.value?.id;
    if (!organizationId) {
      throw new Error('Organization not found');
    }

    await organizationApi.deleteMember(organizationId, userId);
    await fetchUsers();

    $alert.update({
      show: true,
      variant: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete user';
    $alert.update({
      show: true,
      variant: 'danger',
      message: errorMessage,
    });
  }
};
