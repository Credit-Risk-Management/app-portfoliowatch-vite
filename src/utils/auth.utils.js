import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithGoogle,
  signOut as firebaseSignOut,
  getIdToken,
  onAuthStateChanged,
} from './firebase';
import { $global, $auth, $user, $organization } from '@src/signals';
import { signup, getCurrentUser } from '@src/api/auth.api';

/**
 * Initialize auth listener
 * Listens to Firebase auth state changes and updates signals accordingly
 */
export const initAuthListener = () => {
  $global.value = { ...$global.value, isLoading: true };

  return onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // Get Firebase ID token
        const token = await firebaseUser.getIdToken();

        // Fetch user data from backend
        const response = await getCurrentUser(token);

        if (response && response.data) {
          const { user, organization } = response.data;

          // Update signals
          $auth.value = {
            user: firebaseUser,
            token,
            isLoading: false,
          };

          $user.value = {
            id: user.id,
            email: user.email,
            name: user.name,
            organizationId: user.organizationId,
            role: user.role,
          };

          $organization.value = {
            id: organization.id,
            name: organization.name,
            industry: organization.industry,
          };

          $global.value = {
            isLoading: false,
            isSignedIn: true,
          };
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // User is signed in with Firebase but not in backend
        // This means they haven't completed signup
        $global.value = {
          isLoading: false,
          isSignedIn: false,
        };
        $auth.value = { user: null, token: null, isLoading: false };
      }
    } else {
      // User is signed out
      $global.value = {
        isLoading: false,
        isSignedIn: false,
      };
      $auth.value = { user: null, token: null, isLoading: false };
      $user.value = {};
      $organization.value = {};
    }
  });
};

/**
 * Login user with email and password
 */
export const loginUser = async (email, password) => {
  try {
    const user = await signInWithEmailAndPassword(email, password);
    
    // Wait for auth state to be fully updated before returning
    // This ensures the user data is fetched from backend before redirecting
    await waitForAuthStateUpdate();
    
    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Login user with Google
 */
export const loginWithGoogle = async () => {
  try {
    const user = await signInWithGoogle();
    
    // Wait for auth state to be fully updated before returning
    await waitForAuthStateUpdate();
    
    return { success: true, user };
  } catch (error) {
    console.error('Google login error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Wait for auth state to be fully updated
 * This ensures user data is fetched from backend before proceeding
 */
const waitForAuthStateUpdate = () => {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      // Wait until auth is no longer loading and user is signed in
      if (!$global.value.isLoading && $global.value.isSignedIn) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 10000);
  });
};

/**
 * Sign up user with email/password and create organization
 */
export const signupUser = async (userData, orgData) => {
  try {
    // Create Firebase user
    const firebaseUser = await createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );

    // Get Firebase ID token
    const token = await firebaseUser.getIdToken();

    // Create user and organization in backend
    const response = await signup({
      firebaseUid: firebaseUser.uid,
      email: userData.email,
      name: userData.name,
      organizationName: orgData.organizationName,
      industry: orgData.industry,
    }, token);

    if (response && response.data) {
      // The auth listener will handle updating signals
      return { success: true, data: response.data };
    }

    return { success: false, error: 'Failed to create user account' };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sign up user with Google and create organization
 */
export const signupWithGoogle = async (orgData) => {
  try {
    // Sign in with Google (or create account if doesn't exist)
    const firebaseUser = await signInWithGoogle();

    // Get Firebase ID token
    const token = await firebaseUser.getIdToken();

    // Create user and organization in backend
    const response = await signup({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email,
      organizationName: orgData.organizationName,
      industry: orgData.industry,
    }, token);

    if (response && response.data) {
      // The auth listener will handle updating signals
      return { success: true, data: response.data };
    }

    return { success: false, error: 'Failed to create user account' };
  } catch (error) {
    console.error('Google signup error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    await firebaseSignOut();
    // The auth listener will handle clearing signals
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get current user's Firebase ID token
 */
export const getCurrentToken = async () => {
  try {
    return await getIdToken();
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

