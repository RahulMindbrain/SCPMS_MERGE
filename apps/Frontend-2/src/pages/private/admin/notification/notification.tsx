import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Clock,
  X,
  Search,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Trash2,
  Info,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
  fetchUpcomingEvents,
  fetchUnreadCount,
} from '@/redux/thunks/notificationThunks';
import { addNotification } from '@/redux/slices/notificationSlice';
import { toast } from 'sonner';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AdminPageLayout } from '@/components/layout/AdminPageLayout';
import { PageHeader } from '@/components/PageHeader';

import { SOCKET_EVENTS } from "@/socket/socket.events"
import { socket } from '@/socket/socket.config';

type NotificationFilter = 'all' | 'unread' | 'read';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const AdminNotificationPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const { user, userType } = useSelector(
    (state: RootState) => state.auth
  );
  
  const {
    items: notifications = [],
    loading = false,
    unreadCount = 0,
  } = useSelector((state: RootState) => state.notification || {});

  // ─── Fetch Data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 50 }));
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  // ─── Socket Connection ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !user) return;

    const handleConnect = () => {
      socket.emit("join", {
        userId: user.id,
        role: user.role ?? userType,
      });
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);

    // Listen for new notifications - standardized with Backend/SocketProvider
    const handleNewNotification = (data: any) => {
      dispatch(addNotification(data));
      toast.info(`New Signal: ${data.title}`, {
        icon: <Bell className="size-4 text-indigo-500" />,
      });
    };

    socket.on("new_notification", handleNewNotification);
    socket.on(SOCKET_EVENTS.SYSTEM_ALERT, handleNewNotification);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new_notification", handleNewNotification);
      socket.off(SOCKET_EVENTS.SYSTEM_ALERT, handleNewNotification);
    };
  }, [user, userType, dispatch]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      dispatch(fetchUpcomingEvents());
      dispatch(fetchUnreadCount());
    };
    socket.on(SOCKET_EVENTS.APPLICATION_STATUS_UPDATED, handleUpdate);
    socket.on(SOCKET_EVENTS.NEW_JOB, handleUpdate);
    socket.on(SOCKET_EVENTS.SCHEDULE_APPROVED, handleUpdate);
    socket.on(SOCKET_EVENTS.SCHEDULE_CREATED, handleUpdate);
    return () => {
      socket.off(SOCKET_EVENTS.APPLICATION_STATUS_UPDATED, handleUpdate);
      socket.off(SOCKET_EVENTS.NEW_JOB, handleUpdate);
      socket.off(SOCKET_EVENTS.SCHEDULE_APPROVED, handleUpdate);
      socket.off(SOCKET_EVENTS.SCHEDULE_CREATED, handleUpdate);
    };
  }, [dispatch, socket]);

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
      toast.success('All tactical alerts synchronized');
    } catch (error: any) {
      toast.error(error?.toString() || 'Failed to synchronize alerts');
    }
  };

  const handleMarkAsRead = async (id: number, showToast = true) => {
    try {
      await dispatch(markNotificationAsRead(id)).unwrap();
      if (showToast) toast.success('Alert marked as processed');
    } catch (error: any) {
      toast.error(error?.toString() || 'Failed to update alert status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteNotification(id)).unwrap();
      toast.success('Signal purged from system');
    } catch (error: any) {
      toast.error(error?.toString() || 'Failed to purge signal');
    }
  };

  const handleViewDetails = async (notification: NotificationItem) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id, false);
    }
    setSelectedNotification({
      ...notification,
      read: true,
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getTypeConfig = (type: string) => {
    const safeType = type || 'DEFAULT';
    switch (safeType) {
      case 'SYSTEM_ALERT':
      case 'CRITICAL_ERROR':
        return {
          label: 'System',
          icon: ShieldAlert,
          color: 'text-rose-500',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20',
        };
      case 'PLACEMENT_UPDATE':
      case 'DRIVE_CREATED':
        return {
          label: 'Placement',
          icon: Sparkles,
          color: 'text-blue-500',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
        };
      case 'REGISTRATION':
      case 'USER_ACTIVITY':
        return {
          label: 'Activity',
          icon: Info,
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
        };
      case 'WARNING':
        return {
          label: 'Warning',
          icon: AlertTriangle,
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
        };
      default:
        return {
          label: 'Feed',
          icon: Bell,
          color: 'text-indigo-500',
          bg: 'bg-indigo-500/10',
          border: 'border-indigo-500/20',
        };
    }
  };

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (activeFilter === 'unread') filtered = filtered.filter((n) => !n.read);
    if (activeFilter === 'read') filtered = filtered.filter((n) => n.read);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [notifications, activeFilter, searchQuery]);

  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: NotificationItem[] } = {};
    filteredNotifications.forEach((n) => {
      const date = new Date(n.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key = 'Earlier';
      if (date.toDateString() === today.toDateString()) key = 'Today';
      else if (date.toDateString() === yesterday.toDateString()) key = 'Yesterday';
      else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) key = 'This Week';

      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
    return groups;
  }, [filteredNotifications]);

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'];

  const filterTabs: { key: NotificationFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All Intel', count: notifications.length },
    { key: 'unread', label: 'Pending', count: unreadCount },
    { key: 'read', label: 'Archived', count: notifications.length - unreadCount },
  ];

  return (
    <AdminPageLayout>
      <PageHeader
        title="Notifications Feed"
        description="Unified log of system-wide events, placement milestones, and tactical alerts."
        badge="Live Signals"
        icon={Bell}
        variant="indigo"
      >
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Queue Status</span>
            <div className="flex items-center gap-1.5 text-indigo-500 font-black text-xs uppercase">
              <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
              {unreadCount} Alerts Pending
            </div>
          </div>
          <Button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || loading}
            className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 font-black uppercase text-[10px] tracking-widest"
          >
            <CheckCircle2 className="size-4 mr-2" /> Mark All Processed
          </Button>
        </div>
      </PageHeader>

      <div className="space-y-8 pb-10">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-card border border-border/50 shadow-sm">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all active:scale-95',
                  activeFilter === tab.key
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-muted-foreground hover:bg-muted transition-colors'
                )}
              >
                {tab.label}
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[9px] font-black',
                  activeFilter === tab.key ? 'bg-white/20 text-white' : 'bg-muted-foreground/10 text-muted-foreground'
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search signal logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-card border border-border/50 rounded-2xl pl-11 pr-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-12">
          {loading && notifications.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 w-full animate-pulse rounded-[2.5rem] bg-muted/50 border border-border/50" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 rounded-[3rem] border-2 border-dashed border-border/50 bg-card/50">
              <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Bell className="size-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-black text-foreground tracking-tight">System Silence</h3>
              <p className="text-sm font-bold text-muted-foreground mt-1">No tactical alerts currently synchronized with your feed.</p>
            </div>
          ) : (
            groupOrder.map((group) => (
              groupedNotifications[group] && groupedNotifications[group].length > 0 && (
                <div key={group} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 whitespace-nowrap">
                      {group}
                    </h2>
                    <div className="h-px w-full bg-gradient-to-r from-border/50 to-transparent" />
                  </div>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4"
                  >
                    {groupedNotifications[group].map((notification) => {
                      const config = getTypeConfig(notification.type);
                      const Icon = config.icon;

                      return (
                        <motion.div
                          variants={itemVariants}
                          key={notification.id}
                          layout
                          onClick={() => handleViewDetails(notification)}
                          className={cn(
                            'group relative overflow-hidden rounded-[2rem] border transition-all duration-500 cursor-pointer bg-card',
                            !notification.read
                              ? 'bg-white dark:bg-indigo-500/[0.03] border-indigo-500/20 shadow-lg shadow-indigo-500/5'
                              : 'border-border hover:bg-card hover:border-border/80'
                          )}
                        >
                          {!notification.read && (
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500" />
                          )}

                          <div className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row gap-6">
                              <div
                                className={cn(
                                  'size-14 shrink-0 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3',
                                  config.bg,
                                  config.color,
                                  !notification.read && 'animate-pulse'
                                )}
                              >
                                <Icon size={24} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        'px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider',
                                        config.bg,
                                        config.color,
                                        config.border
                                      )}
                                    >
                                      {config.label}
                                    </Badge>

                                    {!notification.read && (
                                      <Badge className="bg-indigo-500 text-white border-none text-[9px] font-black uppercase px-2 py-0.5">
                                        New Signal
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5">
                                      <Clock size={12} />
                                      {formatRelativeTime(notification.createdAt)}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Calendar size={12} />
                                      {new Date(notification.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>

                                <h3 className={cn(
                                  "text-lg font-black tracking-tight mb-2 transition-colors",
                                  !notification.read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                                )}>
                                  {notification.title}
                                </h3>

                                <p className="text-sm font-medium leading-relaxed text-muted-foreground line-clamp-2 max-w-4xl">
                                  {notification.message}
                                </p>

                                <div className="mt-6 flex items-center justify-between pt-6 border-t border-border/40">
                                  <div className="flex items-center gap-6">
                                    <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors">
                                      Inspect Signal
                                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(notification.id);
                                      }}
                                      className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/50 transition-colors"
                                      title="Purge Signal"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              )
            ))
          )}
        </div>
      </div>

      {/* Detail Inspector Modal */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotification(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white dark:bg-slate-900 shadow-2xl"
            >
              <div className={cn(
                "h-2 w-full",
                getTypeConfig(selectedNotification.type).color.includes('rose') ? 'bg-rose-500' :
                getTypeConfig(selectedNotification.type).color.includes('blue') ? 'bg-blue-500' :
                getTypeConfig(selectedNotification.type).color.includes('emerald') ? 'bg-emerald-500' :
                getTypeConfig(selectedNotification.type).color.includes('amber') ? 'bg-amber-500' : 'bg-indigo-500'
              )} />
              
              <div className="p-8 sm:p-12 bg-card">
                <div className="flex items-start justify-between mb-8">
                  <div className="size-16 rounded-2xl flex items-center justify-center bg-muted">
                    {(() => {
                      const config = getTypeConfig(selectedNotification.type);
                      const Icon = config.icon;
                      return <Icon size={32} className="text-foreground/80" />;
                    })()}
                  </div>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="size-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-black uppercase tracking-widest px-3 py-1 text-[10px]">
                      {selectedNotification.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {formatRelativeTime(selectedNotification.createdAt)}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-black tracking-tight leading-tight">
                    {selectedNotification.title}
                  </h2>
                  
                  <div className="p-6 rounded-3xl bg-muted/30 border border-border/50">
                    <p className="text-base font-medium leading-relaxed text-foreground/80">
                      {selectedNotification.message}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setSelectedNotification(null)}
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border-border hover:bg-muted"
                  >
                    Close Inspector
                  </Button>
                  <Button 
                    onClick={() => {
                      handleDelete(selectedNotification.id);
                      setSelectedNotification(null);
                    }}
                    className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-500/20"
                  >
                    Archive Signal
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminPageLayout>
  );
};

export default AdminNotificationPage;
