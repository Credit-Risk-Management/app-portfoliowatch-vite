/* eslint-disable no-unused-vars */
import { Badge, ListGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { formatCurrency } from '@src/utils/formatCurrency';
import { formatMoneyShorthand } from '@src/utils/currency';

const getScoreColor = (watchScore) => {
  if (watchScore >= 5) return 'text-danger-300';
  if (watchScore >= 3) return 'text-warning-300';
  return 'text-success-300';
};

const RecentLoansList = ({ loans }) => {
  if (!loans || loans.length === 0) {
    return (
      <div className="text-center text-white-50 py-24">
        No recent loan activity
      </div>
    );
  }
  return (
    <ListGroup>
      {loans.map((loan) => {
        const borrowerName = loan.borrower?.name || loan.borrowerName || 'Unknown';
        const loanAmount = loan.principalAmount || loan.originalAmount || loan.loanAmount || 0;
        // Convert Decimal to number if needed, handle null/undefined
        const watchScore = loan.watchScore != null ? Number(loan.watchScore) : 0;
        const scoreColor = getScoreColor(watchScore);

        return (
          <ListGroup.Item
            key={loan.id}
            className="d-flex justify-content-between align-items-center text-white mt-8 first:mt-0"
            style={{ cursor: 'pointer' }}
            onClick={() => { window.location.href = `/loans/${loan.id}`; }}
          >
            <div>
              <div className="fw-bold">{borrowerName}</div>
              <div>
                <span className="fw-700 me-8">{formatMoneyShorthand(loanAmount)}{' '}</span>
                <small className={`${scoreColor} fw-700`}>Watch - {watchScore}</small>
              </div>
            </div>
            <div>
              <Badge
                variant="primary"
                className="rounded-pill bg-primary-200 border-primary-50 text-dark fw-400"
              >
                L - {loan.loanNumber}
              </Badge>
            </div>
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
};

export default RecentLoansList;
