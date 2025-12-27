import firebase from 'firebase/compat/app';
import { getConfig } from '@src/config/config';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/analytics';

export const firebaseConfig = getConfig('VITE_APP_FIREBASE_CONFIG');

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

// Clear any tenant ID to avoid auth/invalid-tenant-id errors
// We're not using Firebase's multi-tenancy feature
// Multi-tenancy is handled at the application level with organizations
auth.tenantId = null;

const getAuthForTenant = (tenantId) => {
  // Only set tenant ID if explicitly provided and not 'default'
  if (tenantId && tenantId !== 'default') {
    auth.tenantId = tenantId;
  } else {
    // Clear tenant ID to use default Firebase auth
    auth.tenantId = null;
  }
  return auth;
};

const firestore = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();
const analytics = firebase.analytics();
const now = firebase.firestore.Timestamp.now();
const fbKey = `firebase:authUser:${getConfig('VITE_APP_FIREBASE_PUB_KEY')}:[DEFAULT]`;

const getLocalStorage = () => Object.keys(window.localStorage)
  .filter((item) => item.startsWith('firebase:authUser'))[0];

/**
 * Sign in with email and password
 */
export const signInWithEmailAndPassword = async (email, password) => {
  const result = await auth.signInWithEmailAndPassword(email, password);
  return result.user;
};

/**
 * Create user with email and password
 */
export const createUserWithEmailAndPassword = async (email, password) => {
  const result = await auth.createUserWithEmailAndPassword(email, password);
  return result.user;
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  const result = await auth.signInWithPopup(googleProvider);
  return result.user;
};

/**
 * Sign out
 */
export const signOut = async () => {
  await auth.signOut();
};

/**
 * Get current user's ID token
 */
export const getIdToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return null;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChanged = (callback) => auth.onAuthStateChanged(callback);

export {
  auth,
  firestore,
  googleProvider,
  now,
  getLocalStorage,
  fbKey,
  analytics,
  getAuthForTenant,
};
