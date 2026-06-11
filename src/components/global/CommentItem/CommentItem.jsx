import { ListGroup, Button, Row, Col } from 'react-bootstrap';
import MentionText from '@src/components/global/MentionText';
import { formatDateNumeric } from '@src/utils/formatDate';
import { formatTimeAgo } from '@src/utils/formatRelativeTime';
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
  clickable = false, // whether the item is clickable/hoverable
}) => {
  const displayDate = (dateString) => {
    if (!dateString) return '-';
    return dateFormat === 'relative' ? formatTimeAgo(dateString) : formatDateNumeric(dateString);
  };

  return (
    <ListGroup.Item className={`comment-item ${clickable ? 'comment-item--clickable' : ''}`}>
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
            <div className="text-info-100 fw-200">{displayDate(createdAt)}</div>
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
