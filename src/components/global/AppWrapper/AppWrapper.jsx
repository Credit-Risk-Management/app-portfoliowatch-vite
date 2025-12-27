import useWindowSize from '@src/utils/windowSize';
import { Badge, Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { $global } from '@src/signals';
import Loadable from '../Loadable';

const AppWrapper = () => {
  const { breakPoint } = useWindowSize();

  // Note: Auth state listener is now initialized in App.jsx using initAuthListener()
  // This provides better integration with our new auth system

  return (
    <Container fluid className="p-0 bg-info-900 vh-100">
      {import.meta.env.VITE_DEV_IS_BREAKPOINT_VISABLE === 'true' && (
        <Badge bg="primary" className="breakpointBadge">
          {breakPoint}
        </Badge>
      )}
      <Loadable signal={$global}>
        <Outlet />
      </Loadable>
    </Container>
  );
};

export default AppWrapper;
