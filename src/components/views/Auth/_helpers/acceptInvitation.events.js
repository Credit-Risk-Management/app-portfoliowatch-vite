import * as invitationApi from '@src/api/invitation.api';
import { createUserWithEmailAndPassword, signInWithGoogle, signInWithEmailAndPassword, auth } from '@src/utils/firebase';
import { $global, $user } from '@src/signals';
import { $acceptInvitationView, $acceptInvitationForm } from './acceptInvitation.consts';

/**
 * Handle accepting invitation with email/password
 * @param {string} token - The invitation token
 * @param {Function} navigate - React Router navigate function
 */
export const handleAcceptWithEmail = async (token, navigate) => {
  const formData = $acceptInvitationForm.value;
  const { invitation } = $acceptInvitationView.value;
  const { isSignedIn } = $global.value;
  const currentUser = $user.value;

  // Validation
  if (!formData.name.trim()) {
    $acceptInvitationView.update({ error: 'Name is required' });
    return;
  }

  if (!isSignedIn || currentUser?.email !== invitation.email) {
    if (formData.password !== formData.confirmPassword) {
      $acceptInvitationView.update({ error: 'Passwords do not match' });
      return;
    }

    if (formData.password.length < 6) {
      $acceptInvitationView.update({ error: 'Password must be at least 6 characters' });
      return;
    }
  }

  $acceptInvitationView.update({
    isAccepting: true,
    error: null,
  });

  try {
    let firebaseUid;

    if (isSignedIn && currentUser?.email === invitation.email) {
      // User is already signed in with matching email
      firebaseUid = auth.currentUser?.uid;
      if (!firebaseUid) {
        throw new Error('User not authenticated');
      }
    } else {
      // Try to create Firebase account (will fail if user already exists)
      try {
        const firebaseUser = await createUserWithEmailAndPassword(
          invitation.email,
          formData.password,
        );
        firebaseUid = firebaseUser.uid;
      } catch (createError) {
        // If user already exists, try to sign in
        if (createError.code === 'auth/email-already-in-use') {
          const firebaseUser = await signInWithEmailAndPassword(
            invitation.email,
            formData.password,
          );
          firebaseUid = firebaseUser.uid;
        } else {
          throw createError;
        }
      }
    }

    // Accept invitation
    await invitationApi.acceptInvitation(token, firebaseUid, formData.name);

    // Reset form
    $acceptInvitationForm.reset();
    $acceptInvitationView.update({ isAccepting: false });

    // Redirect to dashboard
    navigate('/dashboard');
  } catch (err) {
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to accept invitation';
    $acceptInvitationView.update({
      error: errorMessage,
      isAccepting: false,
    });
  }
};

/**
 * Handle accepting invitation with Google
 * @param {string} token - The invitation token
 * @param {Function} navigate - React Router navigate function
 */
export const handleAcceptWithGoogle = async (token, navigate) => {
  const { invitation } = $acceptInvitationView.value;

  $acceptInvitationView.update({
    isAccepting: true,
    error: null,
  });

  try {
    const firebaseUser = await signInWithGoogle();

    // Verify email matches invitation
    if (firebaseUser.email !== invitation.email) {
      $acceptInvitationView.update({
        error: 'Google account email does not match invitation email',
        isAccepting: false,
      });
      return;
    }

    // Accept invitation
    await invitationApi.acceptInvitation(
      token,
      firebaseUser.uid,
      firebaseUser.displayName || firebaseUser.email,
    );

    // Reset form
    $acceptInvitationForm.reset();
    $acceptInvitationView.update({ isAccepting: false });

    // Redirect to dashboard
    navigate('/dashboard');
  } catch (err) {
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to accept invitation';
    $acceptInvitationView.update({
      error: errorMessage,
      isAccepting: false,
    });
  }
};

/**
 * Handle accepting invitation when user is already signed in
 * @param {string} token - The invitation token
 * @param {Function} navigate - React Router navigate function
 */
export const handleAcceptSignedIn = async (token, navigate) => {
  const currentUser = $user.value;
  const formData = $acceptInvitationForm.value;

  $acceptInvitationView.update({
    isAccepting: true,
    error: null,
  });

  try {
    const firebaseUid = auth.currentUser?.uid;
    if (!firebaseUid) {
      throw new Error('User not authenticated');
    }

    await invitationApi.acceptInvitation(
      token,
      firebaseUid,
      currentUser.name || formData.name || currentUser.email,
    );

    // Reset form
    $acceptInvitationForm.reset();
    $acceptInvitationView.update({ isAccepting: false });

    // Redirect to dashboard
    navigate('/dashboard');
  } catch (err) {
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to accept invitation';
    $acceptInvitationView.update({
      error: errorMessage,
      isAccepting: false,
    });
  }
};

/**
 * Clear error message
 */
export const clearError = () => {
  $acceptInvitationView.update({ error: null });
};
