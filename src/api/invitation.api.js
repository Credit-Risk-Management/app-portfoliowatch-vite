import apiClient from './client';

/**
 * Create invitation
 */
export const createInvitation = async (organizationId, email, role) => {
  try {
    const response = await apiClient.post('/invitations', {
      organizationId,
      email,
      role,
    });
    return response;
  } catch (error) {
    console.error('Create invitation API error:', error);
    throw error;
  }
};

/**
 * Get invitations for organization
 */
export const getInvitations = async (organizationId) => {
  try {
    const response = await apiClient.get('/invitations');
    return response;
  } catch (error) {
    console.error('Get invitations API error:', error);
    throw error;
  }
};

/**
 * Get invitation by token
 */
export const getInvitationByToken = async (token) => {
  try {
    const response = await apiClient.get(`/invitations/${token}`);
    return response;
  } catch (error) {
    console.error('Get invitation by token API error:', error);
    throw error;
  }
};

/**
 * Accept invitation
 */
export const acceptInvitation = async (token, firebaseUid, name) => {
  try {
    const response = await apiClient.post(`/invitations/${token}/accept`, {
      firebaseUid,
      name,
    });
    return response;
  } catch (error) {
    console.error('Accept invitation API error:', error);
    throw error;
  }
};

/**
 * Revoke invitation
 */
export const revokeInvitation = async (invitationId) => {
  try {
    const response = await apiClient.delete(`/invitations/${invitationId}`);
    return response;
  } catch (error) {
    console.error('Revoke invitation API error:', error);
    throw error;
  }
};

