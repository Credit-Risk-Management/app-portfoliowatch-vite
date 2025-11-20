import { Badge } from 'react-bootstrap';

const StatusBadge = ({ status, type = 'default' }) => {
  const getVariant = () => {
    if (type === 'kyc') {
      switch (status) {
        case 'Verified':
          return 'success';
        case 'Pending':
          return 'warning';
        case 'Incomplete':
          return 'danger';
        case 'Expired':
          return 'dark';
        default:
          return 'secondary';
      }
    }

    if (type === 'risk') {
      // Handle numeric risk ratings (1-5)
      if (typeof status === 'number') {
        switch (status) {
          case 1:
          case 2:
            return 'success';
          case 3:
            return 'warning';
          case 4:
            return 'danger';
          case 5:
            return 'dark';
          default:
            return 'secondary';
        }
      }
      // Handle text-based risk ratings
      switch (status) {
        case 'Low':
          return 'success';
        case 'Medium':
          return 'warning';
        case 'High':
          return 'danger';
        case 'Critical':
          return 'dark';
        default:
          return 'secondary';
      }
    }

    if (type === 'loan') {
      switch (status) {
        case 'Active':
          return 'success';
        case 'Pending':
          return 'warning';
        case 'Approved':
          return 'info';
        case 'Disbursed':
          return 'primary';
        case 'Closed':
          return 'secondary';
        case 'Default':
          return 'danger';
        case 'Restructured':
          return 'dark-300';
        default:
          return 'secondary';
      }
    }

    if (type === 'transaction') {
      switch (status) {
        case 'Completed':
          return 'success';
        case 'Pending':
          return 'warning';
        case 'Failed':
          return 'danger';
        case 'Cancelled':
          return 'secondary';
        case 'Processing':
          return 'info';
        default:
          return 'secondary';
      }
    }

    return 'secondary';
  };

  return (
    <Badge bg={getVariant()} className="px-8 py-4">
      {status}
    </Badge>
  );
};

export default StatusBadge;
