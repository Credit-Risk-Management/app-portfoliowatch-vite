import { $profileView, $profileForm, $user, $alert } from '@src/signals';
import usersApi from '@src/api/users.api';

export const startEditing = () => {
  // Populate form with current user data
  $profileForm.update({
    name: $user.value.name || '',
  });
  $profileView.update({ isEditing: true });
};

export const cancelEditing = () => {
  $profileView.update({ isEditing: false });
  $profileForm.reset();
};

export const saveProfile = async () => {
  try {
    const formData = $profileForm.value;

    if (!formData.name || formData.name.trim() === '') {
      $alert.update({
        show: true,
        variant: 'danger',
        message: 'Name is required',
      });
      return;
    }

    $profileView.update({ isSaving: true });

    await usersApi.updateMe({
      name: formData.name.trim(),
    });

    // Fetch fresh user data from backend to ensure it's up to date
    const userResponse = await usersApi.getMe();
    const userData = userResponse.data;

    // Update user signal with fresh data
    $user.update({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      organizationId: userData.organizationId,
      role: userData.role,
    });

    $profileView.update({ isEditing: false, isSaving: false });
    $profileForm.reset();

    $alert.update({
      show: true,
      variant: 'success',
      message: 'Profile updated successfully',
    });
  } catch (error) {
    $profileView.update({ isSaving: false });
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update profile';
    $alert.update({
      show: true,
      variant: 'danger',
      message: errorMessage,
    });
  }
};
