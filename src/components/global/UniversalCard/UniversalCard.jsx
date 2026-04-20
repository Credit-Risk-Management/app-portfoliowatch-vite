import { Card } from 'react-bootstrap';

const UniversalCard = ({
  headerColor = 'light',
  headerText = '',
  headerRight = null,
  bodyBgColor = 'info-800',
  children = null,
  borderColor = 'info-400',
  className = '',
}) => (
  <Card className={`bg-${bodyBgColor} border border-${borderColor} ${className}`}>
    <Card.Body className="p-24 text-light">
      <div className="d-flex align-items-center justify-content-between gap-8 flex-wrap">
        <div className={`lead text-${headerColor} mb-0`}>{headerText}</div>
        {headerRight}
      </div>
      {children}
    </Card.Body>
  </Card>
);

export default UniversalCard;
