import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { $global } from '@src/signals';
import ContentWrapper from '@src/components/global/ContentWrapper';

const PublicRoutes = () => {
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

  // Redirect to dashboard if user is signed in
  if (authState.isSignedIn && !authState.isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ContentWrapper fluid className="min-vh-100 bg-info-900">
      <Outlet />
    </ContentWrapper>
  );
};

export default PublicRoutes;
