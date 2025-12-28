import { ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CommentItem from '@src/components/global/CommentItem';

const RecentCommentsList = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center text-white-50 py-24">
        No recent comments
      </div>
    );
  }

  return (
    <ListGroup variant="flush">
      {comments.map((comment) => {
        // Get loan ID from comment - it might be in different places depending on the API response
        const loanId = comment.loanId || comment.loan?.id;
        
        // If we have a loan ID, wrap the comment in a link
        if (loanId) {
          return (
            <Link
              key={comment.id}
              to={`/loans/${loanId}`}
              className="text-decoration-none"
            >
              <CommentItem
                userName={comment.userName || 'Unknown User'}
                createdAt={comment.createdAt}
                text={comment.text}
                dateFormat="relative"
                clickable
              />
            </Link>
          );
        }

        // If no loan ID, just render the comment without a link
        return (
          <CommentItem
            key={comment.id}
            userName={comment.userName || 'Unknown User'}
            createdAt={comment.createdAt}
            text={comment.text}
            dateFormat="relative"
          />
        );
      })}
    </ListGroup>
  );
};

export default RecentCommentsList;
