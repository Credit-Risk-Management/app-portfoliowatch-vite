import apiClient from './client';

/**
 * Get organization by ID
 */
export const getOrganization = async (id) => {
  try {
    const response = await apiClient.get(`/organizations/${id}`);
    return response;
  } catch (error) {
    console.error('Get organization API error:', error);
    throw error;
  }
};

/**
 * Update organization
 */
export const updateOrganization = async (id, data) => {
  try {
    const response = await apiClient.put(`/organizations/${id}`, data);
    return response;
  } catch (error) {
    console.error('Update organization API error:', error);
    throw error;
  }
};

/**
 * Get organization members
 */
export const getOrganizationMembers = async (id) => {
  try {
    const response = await apiClient.get(`/organizations/${id}/members`);
    return response;
  } catch (error) {
    console.error('Get organization members API error:', error);
    throw error;
  }
};

/**
 * Add member to organization
 */
export const addMemberToOrganization = async (id, userId, role) => {
  try {
    const response = await apiClient.post(`/organizations/${id}/members`, {
      userId,
      role,
    });
    return response;
  } catch (error) {
    console.error('Add member API error:', error);
    throw error;
  }
};

/**
 * Remove member from organization
 */
export const removeMemberFromOrganization = async (id, userId) => {
  try {
    const response = await apiClient.delete(`/organizations/${id}/members/${userId}`);
    return response;
  } catch (error) {
    console.error('Remove member API error:', error);
    throw error;
  }
};

/**
 * Update member role
 */
export const updateMemberRole = async (id, userId, role) => {
  try {
    const response = await apiClient.put(`/organizations/${id}/members/${userId}/role`, {
      role,
    });
    return response;
  } catch (error) {
    console.error('Update member role API error:', error);
    throw error;
  }
};

/**
 * Suspend member
 */
export const suspendMember = async (id, userId) => {
  try {
    const response = await apiClient.put(`/organizations/${id}/members/${userId}/suspend`);
    return response;
  } catch (error) {
    console.error('Suspend member API error:', error);
    throw error;
  }
};

/**
 * Unsuspend member
 */
export const unsuspendMember = async (id, userId) => {
  try {
    const response = await apiClient.put(`/organizations/${id}/members/${userId}/unsuspend`);
    return response;
  } catch (error) {
    console.error('Unsuspend member API error:', error);
    throw error;
  }
};

/**
 * Delete member
 */
export const deleteMember = async (id, userId) => {
  try {
    const response = await apiClient.delete(`/organizations/${id}/members/${userId}`);
    return response;
  } catch (error) {
    console.error('Delete member API error:', error);
    throw error;
  }
};
