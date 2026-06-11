import { Badge, ListGroup } from 'react-bootstrap';
import { formatMoneyShorthand } from '@src/utils/currency';
import { formatDashboardRelativeTime } from '@src/utils/formatRelativeTime';
import { getWatchScoreColor } from '../_helpers/dashboard.consts';

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
        const watchRating = Number.isFinite(watchScore)
          ? Math.min(5, Math.max(1, Math.round(watchScore)))
          : null;
        const scoreColor = getWatchScoreColor(watchRating);

        return (
          <ListGroup.Item
            key={loan.id}
            className="d-flex justify-content-between align-items-center text-white mt-8 first:mt-0"
            style={{ cursor: 'pointer' }}
            onClick={() => { window.location.href = `/loans/${loan.id}`; }}
          >
            <div className="flex-grow-1">
              <div className="fw-bold">{borrowerName}</div>
              <div>
                <span className="fw-700 me-8">{formatMoneyShorthand(loanAmount)}{' '}</span>
                <small className="fw-700" style={{ color: scoreColor }}>WATCH - {watchScore}</small>
              </div>
              <div className="text-white-50 mt-4" style={{ fontSize: '0.75rem' }}>
                {formatDashboardRelativeTime(loan.updatedAt)}
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
