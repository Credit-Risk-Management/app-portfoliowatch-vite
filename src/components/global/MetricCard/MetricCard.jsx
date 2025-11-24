import { Card } from 'react-bootstrap';

const MetricCard = ({
  title,
  value,
  SubComponent = () => null,
  onClick,
  variant = 'primary',
}) => (
  <Card onClick={onClick} className={`border border-${variant}-300 bg-${variant}-500`}>
    <Card.Body className="pt-24 pb-24 px-40">
      <div className="mb-8 lead">{title}</div>
      <h2 className="mb-0">{value}</h2>
      <SubComponent />
    </Card.Body>
  </Card>
);

export default MetricCard;
