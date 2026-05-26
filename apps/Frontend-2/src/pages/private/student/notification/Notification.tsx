import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Bell,
  Briefcase,
  Calendar,
  Clock,
  Info,
  Sparkles,
  Trash2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
} from '@/redux/thunks/notificationThunks';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Loader from '@/components/Loader';

type NotificationFilter = 'all' | 'unread' | 'read';
type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

import { StudentPageLayout } from '@/components/layout/StudentPageLayout';

const Notification = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const {
    items: notifications = [],
    loading = false,
    pagination = { page: 1, limit: 10, totalPages: 0 },
  } = useSelector((state: RootState) => state.notification || {});

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
      toast.success('All notifications marked as read.');
    } catch (error: any) {
      toast.error(error?.toString() || 'Failed to mark all as read');
    }
  };

  const handleMarkAsRead = async (id: number, showToast = true) => {
    try {
      await dispatch(markNotificationAsRead(id)).unwrap();
      if (showToast) toast.success('Notification marked as read');
    } catch (error: any) {
      toast.error(error?.toString() || 'Failed to mark as read');
    }
  };

  const handleViewDetails = async (notification: NotificationItem) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id, false);
    }
    setSelectedNotification({ ...notification, read: true });
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteNotification(id)).unwrap();
      toast.success('Notification removed');
    } catch (error: any) {
      toast.error(error?.toString() || 'Failed to remove notification');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getTagConfig = (type: string) => {
    switch (type) {
      case 'APPLICATION_SELECTED':
      case 'OFFER_ACCEPTED':
        return { label: 'Selected', icon: Sparkles, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      case 'JOB_POSTED':
      case 'JOB_UPDATED':
        return { label: 'Job', icon: Briefcase, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' };
      case 'SCHEDULE_CREATED':
      case 'SCHEDULE_UPDATED':
        return { label: 'Interview', icon: Calendar, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
      case 'APPLICATION_REJECTED':
      case 'OFFER_REJECTED':
        return { label: 'Update', icon: Info, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
      default: return { label: 'System', icon: Bell, color: 'text-sidebar-foreground/70 dark:text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
    }
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const readCount = useMemo(() => notifications.filter(n => n.read).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'unread') return notifications.filter((n) => !n.read);
    if (activeFilter === 'read') return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, activeFilter]);

  const filterTabs: { key: NotificationFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'read', label: 'Read', count: readCount },
  ];

  if (loading && notifications.length === 0) {
    return <Loader text="Syncing your updates..." fullScreen />;
  }

  return (
    <StudentPageLayout>
      <div className="space-y-8">
        
        {/* Adaptive Hero Banner */}
        <div className="student-hero-banner group">
          <div className="student-hero-mesh">
            <div className="bubble-indigo"></div>
            <div className="bubble-sky"></div>
          </div>

          <div className="student-hero-texture"></div>
          <div className="student-hero-overlay"></div>
          
          <div className="relative z-10 w-full">
            <div className="student-hero-badge">
              <span>Notification Center</span>
            </div>
            <h1 className="student-hero-title">
              Stay <span>Updated</span>
            </h1>
            <p className="student-hero-description">
              {unreadCount > 0 
                ? `You have ${unreadCount} new alerts that require your attention. Stay on top of your journey!`
                : "Track all your recruitment milestones, interview calls, and placement activities in real-time."}
            </p>
          </div>
        </div>

        {/* ─── Controls & Filters ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl p-4 md:p-6 rounded-[2rem] border border-slate-200/60 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center gap-1.5 md:gap-2 bg-slate-100 dark:bg-white/5 p-1 md:p-1.5 rounded-2xl border border-slate-200 dark:border-white/[0.05] overflow-x-auto no-scrollbar w-full sm:w-fit">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  "px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 flex items-center gap-2 whitespace-nowrap",
                  activeFilter === tab.key
                    ? "bg-white dark:bg-[#1e1f26] text-indigo-600 dark:text-indigo-400 shadow-xl border border-slate-200/50 dark:border-white/10 scale-105"
                    : "text-sidebar-foreground/70 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {tab.label}
                <span className={cn(
                  "px-1.5 md:px-2 py-0.5 rounded-lg text-[8px] md:text-[9px] font-black transition-colors shadow-inner",
                  activeFilter === tab.key ? "bg-indigo-500/10" : "bg-slate-200 dark:bg-white/5"
                )}>{tab.count}</span>
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || loading}
            className="w-full sm:w-auto rounded-2xl border-none bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest px-6 md:px-8 h-12 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all shadow-inner"
          >
            Mark all as read <CheckCircle2 className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* ─── Notifications List ─── */}
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            <motion.div layout className="space-y-4">
              {filteredNotifications.map((notification) => {
                const config = getTagConfig(String(notification.type));
                const TagIcon = config.icon;

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    className={cn(
                      "group relative cursor-pointer rounded-[2rem] md:rounded-[2.5rem] border p-6 md:p-8 transition-all duration-500 overflow-hidden",
                      !notification.read
                        ? "bg-indigo-500/[0.08] dark:bg-indigo-500/10 border-indigo-500/30 shadow-2xl shadow-indigo-500/10"
                        : "bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl border-slate-200/60 dark:border-white/[0.08] hover:border-indigo-500/30 hover:shadow-2xl"
                    )}
                  >
                    <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
                      <div className={cn(
                        "flex h-12 w-12 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-[1rem] md:rounded-[1.5rem] border shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                        !notification.read
                          ? cn(config.bg, config.color, config.border)
                          : "bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200/50 dark:border-white/10 shadow-inner"
                      )}>
                        <TagIcon size={20} className="md:w-7 md:h-7" strokeWidth={2.5} />
                      </div>

                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 md:gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border",
                                config.bg, config.color, config.border
                              )}>
                                {config.label}
                              </span>
                              {!notification.read && (
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-indigo-500 animate-pulse" />
                                  <span className="text-[8px] md:text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">New</span>
                                </div>
                              )}
                            </div>
                            <h3 className={cn(
                              "text-base md:text-lg font-black tracking-tight transition-colors",
                              notification.read ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"
                            )}>
                              {notification.title}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0 h-fit w-fit">
                            <Clock size={12} className="text-indigo-500" />
                            {formatTime(notification.createdAt)}
                          </div>
                        </div>

                        <p className={cn(
                          "text-xs md:text-sm leading-relaxed font-medium",
                          notification.read ? "text-slate-500 dark:text-slate-500" : "text-slate-700 dark:text-slate-300"
                        )}>
                          {notification.message}
                        </p>

                        <div className="pt-2 flex flex-wrap items-center gap-4 md:gap-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(notification);
                            }}
                            className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:translate-x-1 transition-transform"
                          >
                            Details <ArrowUpRight size={14} />
                          </button>
                          
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="text-[10px] md:text-[11px] font-black text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                            >
                              Mark as read
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification.id);
                            }}
                            className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-black text-rose-500 hover:text-rose-700 uppercase tracking-widest transition-colors md:opacity-0 md:group-hover:opacity-100"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 md:py-32 flex flex-col items-center text-center bg-white/80 dark:bg-[#161b22]/40 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10 shadow-sm px-4"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-100 dark:bg-white/5 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6 border-2 border-slate-200 dark:border-white/5 shadow-inner">
                <Bell size={40} className="md:w-12 md:h-12" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">All caught up!</h3>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-xs mt-2 font-medium opacity-80">
                {activeFilter === 'all'
                  ? "You don't have any notifications at the moment. Check back later for updates."
                  : `No ${activeFilter} notifications found in your history.`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {pagination.totalPages > pagination.page && (
          <div className="pt-8 flex justify-center pb-8">
            <Button
              onClick={() => dispatch(fetchNotifications({ page: pagination.page + 1, limit: pagination.limit }))}
              disabled={loading}
              className="w-full sm:w-auto rounded-2xl border-none bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-widest px-12 h-14 hover:bg-indigo-600 hover:text-white transition-all shadow-inner active:scale-95"
            >
              {loading ? <Loader size="sm" /> : 'Load older notifications'}
            </Button>
          </div>
        )}

        {/* Details Modal */}
        <AnimatePresence>
          {selectedNotification && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedNotification(null)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg rounded-[2.5rem] bg-white dark:bg-[#1e1f26] p-6 md:p-10 shadow-2xl border border-slate-200 dark:border-white/10"
              >
                <div className="mb-6 md:mb-8 flex items-start justify-between gap-4 md:gap-6">
                  <div className="space-y-2">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border w-fit shadow-sm",
                      getTagConfig(selectedNotification.type).bg,
                      getTagConfig(selectedNotification.type).color,
                      getTagConfig(selectedNotification.type).border
                    )}>
                      {getTagConfig(selectedNotification.type).label}
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedNotification.title}</h3>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{formatTime(selectedNotification.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="rounded-2xl p-2 md:p-3 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 transition-colors shadow-inner"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 dark:bg-white/[0.03] p-6 md:p-8 text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-200 font-medium border border-slate-100 dark:border-white/5 shadow-inner">
                  {selectedNotification.message}
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => setSelectedNotification(null)}
                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/20"
                  >
                    Got it
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </StudentPageLayout>
  );
};

export default Notification;
