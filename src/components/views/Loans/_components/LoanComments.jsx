import { Form, Button, ListGroup } from 'react-bootstrap';
import { $comments } from '@src/signals';
import { $loanDetailNewComment } from '../_helpers/loans.consts';
import { formatDate } from '../_helpers/loans.helpers';
import { handleAddComment } from '../_helpers/loans.events';

const LoanComments = ({ loanId }) => {
  const localComments = $comments.value?.list || [];

  return (
    <>
      <Form className="mt-16 mb-16" onSubmit={(e) => { e.preventDefault(); handleAddComment(loanId); }}>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Add a comment..."
          value={$loanDetailNewComment.value}
          onChange={(e) => { $loanDetailNewComment.value = e.target.value; }}
          className="mb-8 bg-info-900 text-info-100"
        />
        <Button
          onClick={() => handleAddComment(loanId)}
          disabled={!$loanDetailNewComment.value.trim()}
          className="bg-primary-300 text-primary-900 mt-8"
        >
          Add Comment
        </Button>
      </Form>
      {!localComments.length && (<div className="text-muted">No comments yet.</div>)}
      {!!localComments.length && (
        <ListGroup variant="flush">
          {localComments.map((c) => (
            <ListGroup.Item key={c.id}>
              <div className="d-flex justify-content-between">
                <div className="fw-bold text-info-100">{c.userName}</div>
                <div className="text-info-100 fw-200">{formatDate(c.createdAt)}</div>
              </div>
              <div className="text-info-100 fw-200">{c.text}</div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </>
  );
};

export default LoanComments;
