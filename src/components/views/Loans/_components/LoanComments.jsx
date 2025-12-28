import { Form, Button, ListGroup } from 'react-bootstrap';
import { $comments } from '@src/signals';
import MentionInput from '@src/components/global/MentionInput';
import CommentItem from '@src/components/global/CommentItem';
import { $loanDetailNewComment, $loanDetailNewCommentLoading } from '../_helpers/loans.consts';
import { handleAddComment } from '../_helpers/loans.events';

const LoanComments = ({ loanId }) => {
  const localComments = $comments.value?.list || [];

  return (
    <>
      <Form className="mt-16 mb-16" onSubmit={(e) => { e.preventDefault(); handleAddComment(loanId); }}>
        <MentionInput
          value={$loanDetailNewComment.value}
          onChange={(value) => { $loanDetailNewComment.value = value; }}
          placeholder="Add a comment... (type @ to mention someone)"
          rows={3}
          isLoading={$loanDetailNewCommentLoading.value}
        />
        <Button
          onClick={() => handleAddComment(loanId)}
          disabled={!$loanDetailNewComment.value.trim() || $loanDetailNewCommentLoading.value}
          className="bg-primary-300 text-primary-900 mt-8"
        >
          {$loanDetailNewCommentLoading.value ? 'Adding...' : 'Add Comment'}
        </Button>
      </Form>
      {!localComments.length && (<div className="text-muted">No comments yet.</div>)}
      {!!localComments.length && (
        <ListGroup variant="flush">
          {localComments.map((c) => (
            <CommentItem
              key={c.id}
              userName={c.userName}
              createdAt={c.createdAt}
              text={c.text}
              dateFormat="date"
            />
          ))}
        </ListGroup>
      )}
    </>
  );
};

export default LoanComments;
