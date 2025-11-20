import { Card } from 'react-bootstrap';

const MetricCard = ({
  title,
  value,
  SubComponent = () => null,
  onClick,
  variant = 'primary',
}) => (
  <Card onClick={onClick} className={`border border-${variant}-300 bg-${variant}-700`}>
    <Card.Body className="py-40 px-32 text-white">
      <div className="mb-16">{title}</div>
      <h2 className="mb-0">{value}</h2>
      <SubComponent />
    </Card.Body>
  </Card>
);

export default MetricCard;
