import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { api, AppNotification } from '../services/api';

interface NotificationsModalProps {
  onClose: () => void;
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationsModal({ onClose }: NotificationsModalProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.notifications.getAll();
        setNotifications(data);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.read) {
      try {
        await api.notifications.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
    if (notification.link) {
      onClose();
      navigate(notification.link);
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST': return '👋';
      case 'FRIEND_ACCEPTED': return '🤝';
      case 'ANNOUNCEMENT': return '📢';
      default: return '🔔';
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        zIndex: 1000, padding: '3rem 1rem 1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ maxWidth: 420, width: '100%', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Notifications</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {hasUnread && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none', border: 'none', color: 'var(--primary)',
                  fontSize: '0.8rem', cursor: 'pointer', padding: '0.25rem',
                }}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem',
                lineHeight: 1, display: 'flex',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
              <p style={{ fontSize: '0.9rem' }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  display: 'flex', gap: '0.75rem', padding: '0.75rem 0',
                  borderBottom: '1px solid var(--border)',
                  cursor: n.link ? 'pointer' : 'default',
                  opacity: n.read ? 0.6 : 1,
                }}
              >
                {/* Unread dot */}
                <div style={{ width: 8, flexShrink: 0, paddingTop: 6 }}>
                  {!n.read && (
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--primary)',
                    }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 14 }}>{typeIcon(n.type)}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>
                      {n.title}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0' }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
