/* eslint-disable import/prefer-default-export */
import * as invitationApi from '@src/api/invitation.api';
import { $user } from '@src/signals';
import { $acceptInvitationView, $acceptInvitationForm } from './acceptInvitation.consts';

/**
 * Fetch invitation data by token
 * @param {string} token - The invitation token from URL params
 */
export const fetchInvitation = async (token) => {
  if (!token) {
    $acceptInvitationView.update({
      error: 'Invalid invitation link. No token provided.',
      isLoading: false,
    });
    return;
  }

  try {
    $acceptInvitationView.update({
      isLoading: true,
      error: null,
    });

    const response = await invitationApi.getInvitationByToken(token);
    const invitationData = response.data;

    $acceptInvitationView.update({
      invitation: invitationData,
      isLoading: false,
    });

    // If user is signed in and email matches, pre-fill name
    const currentUser = $user.value;
    if (currentUser?.email === invitationData.email) {
      $acceptInvitationForm.update({
        name: currentUser.name || '',
      });
    }
  } catch (err) {
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load invitation';
    $acceptInvitationView.update({
      invitation: null,
      isLoading: false,
      error: errorMessage,
    });
  }
};
