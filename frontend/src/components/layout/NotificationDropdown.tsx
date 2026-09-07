import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../../services/notificationsApi';
import { NotificationDTO } from '@app-issue-track/shared';
import { Bell, Check, CheckCheck } from 'lucide-react';

export const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const data = await notificationsApi.getUserNotifications();
      setNotifications(data);
    } catch {
      // Ignore background notification fetch errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notification: NotificationDTO) => {
    if (!notification.isRead) {
      try {
        await notificationsApi.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
      } catch {
        // Ignore
      }
    }
    setIsOpen(false);
    if (notification.issueId) {
      navigate(`/issues/${notification.issueId}`);
    } else {
      navigate('/notifications');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Notifications ({unreadCount} unread)
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No notifications yet</div>
            ) : (
              notifications.slice(0, 6).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors flex items-start space-x-3 ${
                    !n.isRead ? 'bg-brand-50/40' : ''
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      !n.isRead ? 'bg-brand-600' : 'bg-slate-300'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 leading-snug">{n.title}</p>
                    <p className="text-slate-600 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!n.isRead && <Check className="w-3.5 h-3.5 text-slate-400 hover:text-brand-600" />}
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 border-t border-slate-200 bg-slate-50 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
