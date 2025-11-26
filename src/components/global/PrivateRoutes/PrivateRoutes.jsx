import { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { $global } from '@src/signals';
import ContentWrapper from '../ContentWrapper';
import Loader from '../Loader';

const PrivateRoutes = () => {
  const location = useLocation();
  const [authState, setAuthState] = useState({
    isLoading: $global.value.isLoading,
    isSignedIn: $global.value.isSignedIn,
  });

  // Subscribe to signal changes
  useEffect(() => {
    const updateAuthState = () => {
      setAuthState({
        isLoading: $global.value.isLoading,
        isSignedIn: $global.value.isSignedIn,
      });
    };

    // Update immediately
    updateAuthState();

    // Set up an interval to check for changes (signal library may not have built-in subscription)
    const interval = setInterval(updateAuthState, 100);

    return () => clearInterval(interval);
  }, []);

  // Show loader while checking auth status
  if (authState.isLoading) {
    return (
      <ContentWrapper fluid className="min-vh-100 bg-info-900 d-flex align-items-center justify-content-center">
        <Loader />
      </ContentWrapper>
    );
  }

  // Redirect to login if not signed in
  if (!authState.isSignedIn) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // User is authenticated, render protected content
  return (
    <ContentWrapper fluid className="min-vh-100 bg-info-900">
      <Outlet />
    </ContentWrapper>
  );
};

export default PrivateRoutes;
