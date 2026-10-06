import { Navigate, Outlet } from 'react-router-dom';
import { $user } from '@src/signals';

const SuperAdminRoute = () => {
  if (!$user.value.isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

export default SuperAdminRoute;
