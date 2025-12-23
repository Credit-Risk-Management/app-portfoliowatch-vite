import { Navigate, Outlet } from 'react-router-dom';
import { $global } from '@src/signals';
import ContentWrapper from '@src/components/global/ContentWrapper';

const PublicRoutes = () => {
  if ($global.value.isSignedIn && !$global.value.isLoading) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <ContentWrapper fluid className="min-vh-100 bg-info-900">
      <Outlet />
    </ContentWrapper>
  );
};

export default PublicRoutes;
