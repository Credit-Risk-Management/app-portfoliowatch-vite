import { $profileView, $profileForm, $user, $alert } from '@src/signals';
import * as usersApi from '@src/api/users.api';

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

    const response = await usersApi.updateCurrentUser({
      name: formData.name.trim(),
    });

    // Update user signal with new data
    $user.update({
      ...$user.value,
      name: response.data.name,
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

