import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../ui/Icon';
import {
  getRecentNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
  NOTIFICATION_META,
  type Notification,
} from '../../lib/notificationService';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [count, items] = await Promise.all([
      getUnreadCount(user.id),
      getRecentNotifications(user.id, 8),
    ]);
    setUnreadCount(count);
    setNotifications(items);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotifications(user.id, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev].slice(0, 8));
      setUnreadCount((c) => c + 1);
    });
    return unsub;
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllAsRead(user.id);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    }
    setOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Icon name="notifications" className="text-[#181410] text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#e7dfda] z-20 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e7dfda]">
              <h3 className="font-bold text-[#181410] text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notif) => {
                  const meta = NOTIFICATION_META[notif.type] || {
                    icon: 'notifications',
                    color: 'text-gray-600',
                  };
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleClick(notif)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                        !notif.is_read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <Icon name={meta.icon} className={`${meta.color} text-xl mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notif.is_read ? 'font-semibold' : 'font-medium'} text-[#181410] truncate`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {timeAgo(notif.created_at)}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-[#e7dfda] px-4 py-2">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/notifications');
                }}
                className="w-full text-center text-sm text-primary font-medium hover:underline py-1"
              >
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
