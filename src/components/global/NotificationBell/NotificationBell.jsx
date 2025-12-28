import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, Badge, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { $notifications } from '@src/signals';
import MentionText from '@src/components/global/MentionText';
import * as consts from './_helpers/notificationBell.consts';
import * as helpers from './_helpers/notificationBell.helpers';
import * as events from './_helpers/notificationBell.events';
import * as resolvers from './_helpers/notificationBell.resolvers';
import './NotificationBell.scss';

const NotificationBell = () => {
  const [show, setShow] = useState(false);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    // Fetch initial unread count
    resolvers.fetchUnreadCount();

    // Set up polling for unread count
    pollIntervalRef.current = setInterval(
      resolvers.fetchUnreadCount,
      consts.POLL_INTERVAL_MS,
    );

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Fetch recent notifications when dropdown opens
    if (show) {
      events.handleDropdownToggle(show);
    }
  }, [show]);

  const unreadCount = $notifications.value.unreadCount || 0;
  const notifications = $notifications.value.list || [];

  return (
    <Dropdown
      show={show}
      onToggle={setShow}
      align="end"
      className="notification-bell-dropdown"
    >
      <Dropdown.Toggle
        variant="link"
        id="notification-dropdown"
        className="notification-bell-toggle text-dark position-relative p-2"
      >
        <FontAwesomeIcon icon={faBell} size="lg" />
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.65rem' }}
          >
            {helpers.formatBadgeCount(unreadCount, consts.MAX_BADGE_COUNT)}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-bell-menu shadow-lg">
        <Dropdown.Header className="d-flex justify-content-between align-items-center">
          <span className="fw-bold">Notifications</span>
          {unreadCount > 0 && (
            <Badge bg="primary" pill>
              {unreadCount}
            </Badge>
          )}
        </Dropdown.Header>

        {notifications.length === 0 ? (
          <div className="text-center text-muted p-3">
            No notifications yet
          </div>
        ) : (
          <ListGroup variant="flush" className="notification-list">
            {notifications.map((notification) => (
              <ListGroup.Item
                key={notification.id}
                as={Link}
                to={helpers.getNotificationLink(notification)}
                onClick={() => events.handleNotificationClick(notification, setShow)}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                action
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="fw-semibold text-info-900">{notification.title}</div>
                    <div className="text-info-700 small mt-1" style={{ fontSize: '0.85rem' }}>
                      <MentionText
                        text={helpers.truncateMessage(
                          notification.message,
                          consts.MESSAGE_TRUNCATE_LENGTH,
                        )}
                        mentionClassName="badge bg-primary-300 text-primary-900 mx-1"
                      />
                    </div>
                    <div className="text-info-600" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                      {helpers.formatTimeAgo(notification.createdAt)}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div
                      className="notification-unread-indicator"
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#0d6efd',
                        marginLeft: '8px',
                        marginTop: '4px',
                      }}
                    />
                  )}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        <Dropdown.Divider />
        <Dropdown.Item
          as={Link}
          to="/notifications"
          className="text-center text-primary fw-semibold"
          onClick={() => setShow(false)}
        >
          View All Notifications
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationBell;
