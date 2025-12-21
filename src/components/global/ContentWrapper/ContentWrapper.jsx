/* eslint-disable implicit-arrow-linebreak */
import { $auth } from '@fyclabs/tools-fyc-react/signals';
import { Container } from 'react-bootstrap';
import Loader from '@src/components/global/Loader';
import Navigation from '@src/components/global/Navigation';
import { $global } from '@src/signals';

const ContentWrapper = ({ children, className = '', fluid }) => {
  if ($auth.value?.isLoading) {
    return (
      <div>
        <div className="min-vh-100 w-100 d-flex justify-content-center align-items-center flex-grow-1">
          <Loader
            message={$auth.value?.isLoadingMessage ?? 'Loading...'}
            className="text-center"
          />
        </div>
      </div>
    );
  }

  const hasNavigation = $global.value?.isSignedIn;
  const containerClassName = `${hasNavigation ? 'content-with-fixed-nav' : ''} ${className}`.trim();

  return (
    <div>
      <Navigation />
      <Container fluid={!!fluid} className={containerClassName}>
        {children}
      </Container>
    </div>
  );
};

export default ContentWrapper;
