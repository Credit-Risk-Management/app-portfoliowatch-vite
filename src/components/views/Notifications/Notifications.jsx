import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Container, Row, Col, ListGroup, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '@src/components/global/PageHeader';
import UniversalCard from '@src/components/global/UniversalCard';
import MentionText from '@src/components/global/MentionText';
import CommentItem from '@src/components/global/CommentItem';
import { $notifications, $notificationsView } from '@src/signals';
import * as resolvers from './_helpers/notifications.resolvers';
import * as events from './_helpers/notifications.events';
import * as helpers from './_helpers/notifications.helpers';
import './Notifications.scss';

const Notifications = () => {
  const filter = $notificationsView.value.filter || 'all';
  const notifications = $notifications.value.list || [];
  const unreadCount = $notifications.value.unreadCount || 0;
  const isLoading = $notifications.value.isLoading || false;

  useEffectAsync(async () => {
    await resolvers.fetchNotifications(1, filter);
  }, [filter]);

  return (
    <Container fluid className="notifications-page py-16 px-16 px-md-32">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with your mentions and activity"
        icon={faBell}
      />

      <Row className="">
        <Col lg={8} className="mx-auto">
          <UniversalCard>
            <div className="d-flex justify-content-between align-items-center py-16 mb-24 border-bottom border-grey-300">
              <div className="d-flex align-items-center gap-3">
                <ButtonGroup size="sm">
                  <Button
                    variant={filter === 'all' ? 'primary' : 'outline-primary-100'}
                    onClick={() => events.handleFilterChange('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'primary' : 'outline-primary-100'}
                    onClick={() => events.handleFilterChange('unread')}
                  >
                    Unread
                    {unreadCount > 0 && (
                      <Badge bg="danger" pill className="ms-4">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant={filter === 'read' ? 'primary' : 'outline-primary-100'}
                    onClick={() => events.handleFilterChange('read')}
                  >
                    Read
                  </Button>
                </ButtonGroup>
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="success-200"
                  size="sm"
                  onClick={events.handleMarkAllAsRead}
                >
                  <FontAwesomeIcon icon={faCheckDouble} className="me-4" />
                  Mark All as Read
                </Button>
              )}
            </div>

            {(() => {
              if (isLoading) {
                return (
                  <div className="text-center py-5 text-info-100">
                    Loading notifications...
                  </div>
                );
              }

              if (notifications.length === 0) {
                let message = 'No notifications yet';
                if (filter === 'unread') message = 'No unread notifications';
                if (filter === 'read') message = 'No read notifications';

                return (
                  <div className="text-center py-5 text-info-100">
                    <FontAwesomeIcon icon={faBell} size="3x" className="mb-3 opacity-50" />
                    <p className="mb-0">{message}</p>
                  </div>
                );
              }

              return (
                <ListGroup variant="flush">
                  {notifications.map((notification) => {
                    // Render MENTION notifications using CommentItem
                    if (notification.type === 'MENTION') {
                      return (
                        <Link
                          key={notification.id}
                          to={helpers.getNotificationLink(notification)}
                          className="text-decoration-none"
                          onClick={() => events.handleNotificationClick(notification)}
                        >
                          <CommentItem
                            userName={notification.title}
                            createdAt={notification.createdAt}
                            text={notification.message}
                            isRead={notification.isRead}
                            onMarkAsRead={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              events.handleMarkAsRead(notification.id);
                            }}
                            showReadStatus
                            dateFormat="relative"
                          />
                        </Link>
                      );
                    }

                    // Default rendering for other notification types
                    return (
                      <ListGroup.Item
                        key={notification.id}
                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <Link
                              to={helpers.getNotificationLink(notification)}
                              className="text-decoration-none"
                              onClick={() => events.handleNotificationClick(notification)}
                            >
                              <div className="d-flex align-items-start">
                                {!notification.isRead && (
                                  <div
                                    className="notification-unread-indicator me-2"
                                    style={{
                                      width: '8px',
                                      height: '8px',
                                      borderRadius: '50%',
                                      backgroundColor: '#0d6efd',
                                      marginTop: '6px',
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                                <div>
                                  <div className="fw-semibold text-dark mb-1">
                                    {notification.title}
                                  </div>
                                  <div className="text-muted small">
                                    <MentionText
                                      text={notification.message}
                                      mentionClassName="badge bg-primary-300 text-primary-900 mx-1"
                                    />
                                  </div>
                                  <div
                                    className="text-muted mt-1"
                                    style={{ fontSize: '0.75rem' }}
                                  >
                                    {helpers.formatTimeAgo(notification.createdAt)}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>

                          {!notification.isRead && (
                            <Button
                              variant="link"
                              size="sm"
                              className="text-muted"
                              onClick={() => events.handleMarkAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              );
            })()}
          </UniversalCard>
        </Col>
      </Row>
    </Container>
  );
};

export default Notifications;
