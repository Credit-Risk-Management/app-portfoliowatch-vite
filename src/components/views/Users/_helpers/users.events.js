import { $users, $usersView, $usersForm, $user, $organization, $settingsView } from '@src/signals';
import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
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
  const isSettingsModal = $settingsView.value?.showInviteModal;
  const $view = isSettingsModal ? $settingsView : $usersView;

  try {
    $view.update({ isLoading: true });
    const formData = $usersForm.value;
    const organizationId = $user.value?.organizationId || $organization.value?.id;

    if (!organizationId) {
      $view.update({ isLoading: false });
      dangerAlert('Organization not found');
      return;
    }

    if (!formData.email) {
      $view.update({ isLoading: false });
      dangerAlert('Email is required');
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
    $view.update({ showInviteModal: false });
    $usersForm.reset();

    successAlert('Invitation sent successfully');
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send invitation';
    dangerAlert(errorMessage);
  } finally {
    $view.update({ isLoading: false });
  }
};

export const handleResendInvitation = async (invitationId) => {
  try {
    await invitationApi.resendInvitation(invitationId);
    await fetchUsers();

    successAlert('Invitation resent successfully');
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to resend invitation';
    dangerAlert(errorMessage);
  }
};

export const handleRevokeInvitation = async (invitationId) => {
  try {
    await invitationApi.revokeInvitation(invitationId);
    await fetchUsers();

    successAlert('Invitation revoked successfully');
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to revoke invitation';
    dangerAlert(errorMessage);
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

    successAlert('User suspended successfully');
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to suspend user';
    dangerAlert(errorMessage);
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

    successAlert('User unsuspended successfully');
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to unsuspend user';
    dangerAlert(errorMessage);
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

    successAlert('User deleted successfully');
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete user';
    dangerAlert(errorMessage);
  }
};
