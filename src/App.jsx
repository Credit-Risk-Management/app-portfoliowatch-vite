import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import '@src/scss/style.scss';
import NotFound from '@src/components/views/NotFound';
import Home from '@src/components/views/Home';
import Dashboard from '@src/components/views/Dashboard';
import Borrowers from '@src/components/views/Borrowers';
import BorrowerDetail from '@src/components/views/Borrowers/BorrowerDetail';
import Loans from '@src/components/views/Loans';
import LoanDetail from '@src/components/views/Loans/LoanDetail';
import Documents from '@src/components/views/Documents';
import Reports from '@src/components/views/Reports';
import Managers from '@src/components/views/Managers';
import ManagerDetail from '@src/components/views/Managers/ManagerDetail';
import { Login, AcceptInvitation } from '@src/components/views/Auth';
import Profile from '@src/components/views/Profile';
import Settings from '@src/components/views/Settings';
import PublicFinancialUpload from '@src/components/views/Borrowers/PublicFinancialUpload';
import PublicRoutes from '@src/components/global/PublicRoutes';
import PrivateRoutes from '@src/components/global/PrivateRoutes';
import { initAuthListener } from '@src/utils/auth.utils';
import AppWrapper from './components/global/AppWrapper';
import Alert from './components/global/Alert';

function App() {
  useEffect(() => {
    // Initialize Firebase auth listener
    const unsubscribe = initAuthListener();

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <>
      <Alert />
      <Router>
        <Routes>
          <Route element={<AppWrapper />}>
            {/* Public auth routes */}
            <Route element={<PublicRoutes />}>x
              <Route path="/login" element={<Login />} />
              <Route path="/accept-invitation" element={<AcceptInvitation />} />
              <Route path="/upload-financials/:token" element={<PublicFinancialUpload />} />
            </Route>

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/home" element={<Home />} />

            {/* Protected routes */}
            <Route element={<PrivateRoutes />}>
              <Route path="/loans" element={<Loans />} />
              <Route path="/loans/:loanId" element={<LoanDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/borrowers" element={<Borrowers />} />
              <Route path="/borrowers/:borrowerId" element={<BorrowerDetail />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/relationship-managers" element={<Managers />} />
              <Route path="/relationship-managers/:managerId" element={<ManagerDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Public routes */}
            <Route element={<PublicRoutes />}>
              <Route path="/public" element={<h1>Public Route</h1>} />
            </Route>

            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
