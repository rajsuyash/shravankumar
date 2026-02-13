import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from '../components/ui/Icon';
import {
  getRecentNotifications,
  markAsRead,
  markAllAsRead,
  NOTIFICATION_META,
  type Notification,
} from '../lib/notificationService';
import { format } from 'date-fns';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const items = await getRecentNotifications(user.id, 50);
      setNotifications(items);
      setLoading(false);
    })();
  }, [user]);

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  const handleMarkRead = async (notif: Notification) => {
    if (notif.is_read) return;
    await markAsRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background-light py-12">
      <div className="max-w-[800px] mx-auto px-4 md:px-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-8"
        >
          <Icon name="arrow_back" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-xl border border-[#e7dfda] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7dfda]">
            <div>
              <h1 className="text-2xl font-bold text-[#181410]">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filter === 'all' ? 'bg-white shadow text-[#181410]' : 'text-gray-500'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filter === 'unread' ? 'bg-white shadow text-[#181410]' : 'text-gray-500'
                  }`}
                >
                  Unread
                </button>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <Icon name="progress_activity" className="text-primary text-3xl animate-spin" />
              <p className="text-gray-400 mt-2 text-sm">Loading notifications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Icon name="notifications_off" className="text-gray-300 text-5xl" />
              <p className="text-gray-400 mt-3">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <div>
              {filtered.map((notif) => {
                const meta = NOTIFICATION_META[notif.type] || {
                  icon: 'notifications',
                  color: 'text-gray-600',
                };
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleMarkRead(notif)}
                    className={`w-full text-left px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                      !notif.is_read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          meta.color.replace('text-', 'bg-').replace('600', '100')
                        }`}
                      >
                        <Icon name={meta.icon} className={`${meta.color} text-xl`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm ${
                              !notif.is_read ? 'font-semibold' : 'font-medium'
                            } text-[#181410]`}
                          >
                            {notif.title}
                          </p>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {format(new Date(notif.created_at), 'dd MMM, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full mt-1.5 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
