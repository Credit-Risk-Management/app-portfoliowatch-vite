import { Card } from 'react-bootstrap';

const UniversalCard = ({
  headerColor = 'light',
  headerText = '',
  bodyBgColor = 'info-800',
  children = null,
  borderColor = 'info-400',
  className = '',
}) => (
  <Card className={`bg-${bodyBgColor} border border-${borderColor} ${className}`}>
    <Card.Body className="p-24 text-light">
      <div className={`lead text-${headerColor}`}>{headerText}</div>
      {children}
    </Card.Body>
  </Card>
);

export default UniversalCard;
