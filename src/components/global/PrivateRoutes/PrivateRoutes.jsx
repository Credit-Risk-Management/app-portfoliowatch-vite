import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { $global } from '@src/signals';
import ContentWrapper from '../ContentWrapper';
import Loader from '../Loader';

const PrivateRoutes = () => {
  const location = useLocation();

  // Show loader while checking auth status
  if ($global.value.isLoading) {
    return (
      <ContentWrapper fluid className="min-vh-100 bg-info-900 d-flex align-items-center justify-content-center">
        <Loader />
      </ContentWrapper>
    );
  }

  // Redirect to login if not signed in
  if (!$global.value.isSignedIn) {
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
