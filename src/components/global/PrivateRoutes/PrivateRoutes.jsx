/* eslint-disable no-unused-vars */
import { Outlet, Navigate } from 'react-router-dom';
import { $global } from '@src/signals';
import ContentWrapper from '../ContentWrapper';

const PrivateRoutes = () =>
// if (!$global.value.isSignedIn && !$global.value.isLoading) {
//   return <Navigate to={`/?redirect=${window.location.pathname}`} />;
// }
// eslint-disable-next-line indent, implicit-arrow-linebreak
(
  <ContentWrapper fluid className="min-vh-100 bg-info-900">
    <Outlet />
  </ContentWrapper>
  // eslint-disable-next-line indent
);
export default PrivateRoutes;
