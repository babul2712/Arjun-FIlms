'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trash2, 
  CreditCard, 
  Camera, 
  Briefcase, 
  FileText, 
  Users, 
  ArrowRight,
  Sparkles,
  Inbox
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  clearAllNotifications 
} from '@/app/actions';
import { NotificationItem, NotificationType } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const getCategoryIcon = (type: NotificationType) => {
  switch (type) {
    case 'payment':
      return <CreditCard className="w-4 h-4 text-emerald-500" />;
    case 'shoot':
      return <Camera className="w-4 h-4 text-[#e50914]" />;
    case 'project':
      return <Briefcase className="w-4 h-4 text-rose-500" />;
    case 'quotation':
      return <FileText className="w-4 h-4 text-amber-500" />;
    case 'crew':
      return <Users className="w-4 h-4 text-sky-500" />;
    default:
      return <Bell className="w-4 h-4 text-[#e50914]" />;
  }
};

const getCategoryBadgeClass = (type: NotificationType) => {
  switch (type) {
    case 'payment':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900';
    case 'shoot':
      return 'bg-red-50 text-[#e50914] border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900';
    case 'project':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900';
    case 'quotation':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900';
    case 'crew':
      return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
  }
};

const formatTimeAgo = (dateString: string) => {
  if (!dateString) return 'Recently';
  const now = new Date().getTime();
  const date = new Date(dateString).getTime();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

export default function NotificationDrawer() {
  const router = useRouter();
  const { notificationDrawerOpen, setNotificationDrawerOpen } = useUIStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | NotificationType>('all');

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (notificationDrawerOpen) {
      fetchList();
    }
  }, [notificationDrawerOpen]);

  // Periodic poll every 45s for fresh notifications
  useEffect(() => {
    fetchList();
    const interval = setInterval(fetchList, 45000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id && n.id !== id));
      toast.success('Notification removed');
    } catch (e) {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications(prev => prev.filter(n => !n.read));
      toast.success('Read notifications cleared');
    } catch (e) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read && (notif._id || notif.id)) {
      await handleMarkAsRead(notif._id || notif.id!);
    }
    setNotificationDrawerOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  if (!notificationDrawerOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setNotificationDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#121418] shadow-2xl flex flex-col h-full border-l border-[#fee2e2]/60 dark:border-gray-800 transition-all duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#fee2e2]/60 dark:border-gray-800/80 flex justify-between items-center bg-[#fdf6f6] dark:bg-gray-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#fee2e2] dark:bg-red-950/50 flex items-center justify-center text-[#e50914]">
                <Bell className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-extrabold text-gray-900 dark:text-white leading-tight">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-black bg-[#e50914] text-white rounded-full animate-pulse">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Live studio activity & payment alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-2 text-gray-500 hover:text-[#e50914] hover:bg-[#fee2e2]/50 dark:hover:bg-gray-800 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => setNotificationDrawerOpen(false)} 
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 px-6 py-3 border-b border-gray-100 dark:border-gray-800/60 overflow-x-auto custom-scrollbar bg-white dark:bg-[#121418]">
            {[
              { id: 'all', label: 'All' },
              { id: 'payment', label: 'Payments' },
              { id: 'shoot', label: 'Shoots' },
              { id: 'project', label: 'Projects' },
              { id: 'quotation', label: 'Quotes' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[#e50914] text-white shadow-xs shadow-red-500/20'
                    : 'bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notification List Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar text-[13px] bg-[#fdfaf8] dark:bg-[#0f1115]">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[12px] font-semibold text-gray-400">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center space-y-3 bg-white dark:bg-[#16181c] rounded-2xl border border-gray-100 dark:border-gray-800 mt-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto text-gray-300">
                  <Inbox className="w-6 h-6" />
                </div>
                <h4 className="text-[14px] font-bold text-gray-700 dark:text-gray-200">No notifications here</h4>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto">You're all caught up! New client payments and shoot reminders will appear here automatically.</p>
              </div>
            ) : (
              filteredNotifications.map((notif, idx) => {
                const notifId = notif._id || notif.id || `notif-${idx}`;
                return (
                  <div
                    key={notifId}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                      !notif.read
                        ? 'bg-white dark:bg-[#181a20] border-[#fecaca] dark:border-red-950/60 shadow-xs hover:border-[#e50914]/50'
                        : 'bg-white/70 dark:bg-[#14161a] border-gray-150 dark:border-gray-800/60 hover:bg-white dark:hover:bg-[#181a20]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Category Icon Badge */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${getCategoryBadgeClass(notif.type)}`}>
                        {getCategoryIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-[12.5px] truncate ${!notif.read ? 'font-extrabold text-gray-900 dark:text-white' : 'font-bold text-gray-700 dark:text-gray-300'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>

                        <p className="text-[11.5px] text-gray-600 dark:text-gray-400 font-medium line-clamp-2 mt-1 leading-snug">
                          {notif.message}
                        </p>

                        {/* Action Link & Controls */}
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100/60 dark:border-gray-800/40">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e50914] group-hover:translate-x-0.5 transition-transform">
                            View details <ArrowRight className="w-3 h-3" />
                          </span>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={(e) => handleDelete(notifId, e)}
                              className="p-1 text-gray-400 hover:text-rose-500 rounded-md transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Unread Red Dot */}
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#e50914] absolute top-3.5 right-3.5 shadow-xs shadow-red-500/50 animate-pulse" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121418] flex items-center justify-between">
            <button
              onClick={handleClearAll}
              className="text-[11px] font-bold text-gray-500 hover:text-[#e50914] transition-colors cursor-pointer"
            >
              Clear read notifications
            </button>
            <button
              onClick={fetchList}
              className="text-[11px] font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              Refresh ↻
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
