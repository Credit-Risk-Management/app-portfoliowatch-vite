import { ListGroup, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons';

const RecentCommentsList = ({ comments }) => {
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const minutesText = (diffInSeconds) > 1 ? 'Minutes' : 'Minute';

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${minutesText} Ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} Hours Ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} Days Ago`;
    return date.toLocaleDateString();
  };

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center text-white-50 py-24">
        No recent comments
      </div>
    );
  }

  return (
    <ListGroup>
      {comments.map((comment) => (
        <ListGroup.Item
          key={comment.id}
          className="d-flex justify-content-between align-items-center bg-transparent border-0 text-white mt-8 first:mt-0"
        >
          <div className="d-flex align-items-center pe-80">
            <FontAwesomeIcon icon={faEnvelopeOpen} className="text-info-100 me-16" size="lg" />
            <div>
              <div className="fw-bold d-flex align-items-center">
                <span className="me-4">{comment.userName || 'Unknown User'}</span>
                {comment.loan?.loan_number && (
                  <Badge
                    className="bg-info-800 text-white border rounded-pill"
                    style={{ paddingY: 1, paddingX: 4, fontSize: 8 }}
                  >
                    {comment.loan.loanNumber}
                  </Badge>
                )}
              </div>
              <div>
                {comment.text && comment.text.length > 100
                  ? `${comment.text.substring(0, 200)}...`
                  : comment.text}
              </div>
            </div>
          </div>
          <div className="text-info-100 text-end" style={{ whiteSpace: 'nowrap' }}>
            {formatTimeAgo(comment.createdAt)}
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default RecentCommentsList;
