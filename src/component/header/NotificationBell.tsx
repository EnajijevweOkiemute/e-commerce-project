import { useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";

export function NotificationBell() {
  const { currentUser, notifications, markNotificationRead } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const myNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter((notification) => notification.userId === currentUser.id);
  }, [currentUser, notifications]);

  const unreadCount = myNotifications.filter((notification) => !notification.read).length;

  if (!currentUser) return null;

  return (
    <div className="notification-menu">
      <button
        type="button"
        className="notification-trigger"
        aria-label="Notifications"
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount ? <span className="cart-badge">{unreadCount}</span> : null}
      </button>
      {isOpen ? (
        <div className="notification-panel">
          <div className="notification-panel__head">
            <strong>Notifications</strong>
          </div>
          {myNotifications.length ? (
            <div className="notification-list">
              {myNotifications.slice(0, 5).map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={notification.read ? "notification-item" : "notification-item notification-item--unread"}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <strong>{notification.title}</strong>
                  <span>{notification.message}</span>
                  <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </button>
              ))}
            </div>
          ) : (
            <p className="muted">No notifications yet.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
