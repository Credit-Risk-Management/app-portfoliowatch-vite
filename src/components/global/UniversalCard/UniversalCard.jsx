import { Card } from 'react-bootstrap';

const UniversalCard = ({
  headerColor = 'light',
  headerText = '',
  bodyBgColor = 'info-800',
  bodyContainer = 'container-fluid', // OR 'container'
  children = null,
  borderColor = 'info-400',
}) => (
  <Card className={`bg-${bodyBgColor} border border-${borderColor}`}>
    <Card.Body className="p-24 text-light">
      <div className={`lead text-${headerColor}`}>{headerText}</div>
      <div className={`${bodyContainer}`}>{children}</div>
    </Card.Body>
  </Card>
);

export default UniversalCard;
