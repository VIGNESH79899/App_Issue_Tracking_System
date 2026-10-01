import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../services/notificationsApi';
import { NotificationDTO } from '@app-issue-track/shared';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Bell, CheckCheck, Check, ArrowRight } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationsApi.getUserNotifications();
      setNotifications(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch notifications inbox');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All Marked Read');
    } catch {
      toast.error('Failed to mark notifications read');
    }
  };

  const handleNotificationClick = async (n: NotificationDTO) => {
    if (!n.isRead) {
      try {
        await notificationsApi.markAsRead(n.id);
        setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)));
      } catch {
        // Ignore
      }
    }

    if (n.issueId) {
      navigate(`/issues/${n.issueId}`);
    }
  };

  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications = filter === 'UNREAD' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">In-App Notifications Inbox</h1>
          <p className="text-xs text-slate-500 mt-1">
            System alerts for issue assignments, status transitions, and discussions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={handleMarkAllRead} leftIcon={<CheckCheck className="w-4 h-4" />}>
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            filter === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            filter === 'UNREAD'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {isLoading ? (
        <SkeletonLoader rows={5} height="h-16" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadNotifications} />
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-xs text-slate-500">
          No notifications match the selected filter.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-subtle divide-y divide-slate-100 overflow-hidden">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 text-xs cursor-pointer hover:bg-slate-50 transition-colors flex items-start justify-between space-x-4 ${
                !n.isRead ? 'bg-brand-50/30' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    !n.isRead ? 'bg-brand-600' : 'bg-slate-300'
                  }`}
                />
                <div>
                  <h4 className="font-bold text-slate-900 leading-snug">{n.title}</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {n.issueId && (
                  <span className="text-brand-600 hover:underline flex items-center space-x-1 font-semibold text-[11px]">
                    <span>View Issue</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
                {!n.isRead && <Check className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
