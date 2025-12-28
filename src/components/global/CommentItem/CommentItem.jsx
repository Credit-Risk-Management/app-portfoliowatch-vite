import { ListGroup, Button, Row, Col } from 'react-bootstrap';
import MentionText from '@src/components/global/MentionText';
import moment from 'moment';
import './CommentItem.scss';

const CommentItem = ({
  userName,
  createdAt,
  text,
  isRead,
  onMarkAsRead,
  showReadStatus = false,
  mentionClassName = 'fw-bold text-warning-300 mx-1',
  dateFormat = 'date', // 'date' for MM/DD/YYYY or 'relative' for time ago
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    if (dateFormat === 'relative') {
      return moment(dateString).fromNow();
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <ListGroup.Item className="comment-item">
      <Row>
        <Col className="border-bottom border-info-700 pb-4">
          <div className="fw-bold text-info-100">{userName}</div>
          <div className="text-info-100 fw-200">
            <MentionText text={text} mentionClassName={mentionClassName} />
          </div>
        </Col>
        <Col className="text-end d-flex justify-content-end border-bottom border-info-700 pb-4">
          <div className="d-flex align-items-end flex-column">
            {showReadStatus && !isRead && (
              <div className="bg-primary-300 rounded-circle" style={{ width: '8px', height: '8px' }} />
            )}
            <div className="text-info-100 fw-200">{formatDate(createdAt)}</div>
            <div className="">
              {showReadStatus && !isRead && onMarkAsRead && (
                <Button
                  variant="link"
                  size="sm"
                  className="text-light p-0 mt-4"
                  onClick={onMarkAsRead}
                >
                  <small>Mark as read</small>
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </ListGroup.Item>
  );
};

export default CommentItem;
