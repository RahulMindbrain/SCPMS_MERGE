import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Bell,
  Clock,
  Trash2,
  X,
  Search,
  Building2,
  Users,
  Briefcase,
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

type NotificationFilter = 'all' | 'unread' | 'read';
type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

const CompanyNotificationPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const {
    items: notifications = [],
    loading = false,
  } = useSelector((state: RootState) => state.notification || {});

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 50 }));
  }, [dispatch]);

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
      toast.success('All notifications marked as read');
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
      case 'NEW_APPLICANT':
        return { 
          label: 'Applicant', 
          icon: Users, 
          color: 'text-indigo-600 dark:text-indigo-400', 
          bg: 'bg-indigo-50 dark:bg-indigo-500/10', 
          border: 'border-indigo-100 dark:border-indigo-500/20' 
        };
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_UPDATED':
        return { 
          label: 'Interview', 
          icon: Clock, 
          color: 'text-amber-700 dark:text-amber-400', 
          bg: 'bg-amber-50 dark:bg-amber-500/10', 
          border: 'border-amber-100 dark:border-amber-500/20' 
        };
      case 'JOB_STATUS_CHANGE':
        return { 
          label: 'Job', 
          icon: Briefcase, 
          color: 'text-emerald-700 dark:text-emerald-400', 
          bg: 'bg-emerald-50 dark:bg-emerald-500/10', 
          border: 'border-emerald-100 dark:border-emerald-500/20' 
        };
      case 'SYSTEM_MESSAGE':
        return { 
          label: 'System', 
          icon: Building2, 
          color: 'text-slate-600 dark:text-slate-400', 
          bg: 'bg-slate-100 dark:bg-white/5', 
          border: 'border-slate-200 dark:border-white/10' 
        };
      default: 
        return { 
          label: 'Update', 
          icon: Bell, 
          color: 'text-blue-600 dark:text-blue-400', 
          bg: 'bg-blue-50 dark:bg-blue-500/10', 
          border: 'border-blue-100 dark:border-blue-500/20' 
        };
    }
  };

  const itemVariants = {
    hidden: { y: 12, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.25, ease: 'easeOut' as const } },
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
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

  const filterTabs: { key: NotificationFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'read', label: 'Read', count: notifications.length - unreadCount },
  ];

  return (
    <div className="min-h-screen pb-20 bg-background animate-in fade-in duration-500">
      {/* Hero Header Banner */}
      <div className="p-4 md:p-8">
        <div className="company-hero-banner relative overflow-hidden group rounded-3xl shadow-xl">
          <div className="hero-mesh">
            <div className="bubble-primary" />
            <div className="bubble-secondary" />
          </div>
          <div className="hero-texture" />
          
          <div className="relative z-10 space-y-4">
            <div className="hero-badge">
              <Bell size={12} className={cn("text-white", unreadCount > 0 && "animate-pulse")} />
              Notification Center
            </div>
            <h1 className="hero-title text-3xl sm:text-4xl lg:text-5xl font-black">
              Pulse <br />
              <span>Dashboard</span>
            </h1>
            <p className="hero-description text-sm max-w-xl text-white/80 font-medium">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread updates that require your attention. Stay synchronized with your recruitment drives.`
                : "Track all applicant milestones, interview scheduling updates, and system alerts in one centralized feed."}
            </p>
          </div>

          {unreadCount > 0 && (
            <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-inner">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white">
                {unreadCount} Alerts Pending
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-6">

        {/* ─── Controls & Filters ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/75 dark:bg-card/45 backdrop-blur-md p-4 rounded-2xl border border-border/80 shadow-sm">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-muted/60 dark:bg-white/5 p-1 rounded-xl border border-border/40 overflow-x-auto no-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap",
                  activeFilter === tab.key
                    ? "bg-background text-foreground shadow-sm border border-border/50 scale-[1.02]"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/20"
                )}
              >
                <span>{tab.label}</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors",
                  activeFilter === tab.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Search and Action */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-[240px] group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-muted/40 border border-border/60 hover:border-border focus:bg-background focus:border-primary/45 rounded-xl transition-all font-medium text-xs text-foreground focus:outline-none"
              />
            </div>
            
            <Button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || loading}
              className="w-full sm:w-auto rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold text-xs px-4 h-9 transition-all border border-primary/20"
            >
              Mark all read
            </Button>
          </div>
        </div>

        {/* ─── Notifications List ─── */}
        <div className="space-y-3 pb-20">
          {loading && notifications.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-muted/20 border border-border/40" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/5 py-20 text-center group">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-transform group-hover:scale-105 duration-300 shadow-inner">
                <Bell size={24} className="opacity-40 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-foreground tracking-tight">All caught up!</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1 max-w-xs mx-auto">You've cleared all your updates. We'll let you know when something new arrives.</p>
              <Button 
                variant="ghost" 
                onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                className="mt-4 font-semibold text-xs text-primary hover:bg-primary/5 rounded-xl h-8 px-4"
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification) => {
                const config = getTagConfig(notification.type);
                const Icon = config.icon;

                return (
                  <motion.div
                    layout
                    key={notification.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    className={cn(
                      'group relative overflow-hidden p-4 md:p-5 rounded-2xl border transition-all duration-300 cursor-pointer bg-card',
                      !notification.read 
                        ? 'border-primary/20 shadow-[0_4px_12px_-4px_rgba(0,82,255,0.05)] bg-gradient-to-r from-primary/[0.015] to-transparent' 
                        : 'border-border/50 opacity-90 hover:opacity-100 hover:border-border hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.02)]'
                    )}
                  >
                    {!notification.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}

                    <div className="flex items-start gap-4">
                      {/* Sleek Tag/Type Icon */}
                      <div className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:rotate-3',
                        !notification.read ? cn(config.bg, config.color, config.border) : 'bg-muted text-muted-foreground border-border/40'
                      )}>
                        <Icon size={18} strokeWidth={2.2} />
                      </div>

                      {/* Content Panel */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        {/* Upper Metabar */}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'text-[10px] font-semibold px-2 py-0.5 rounded-md border shadow-[0_1px_2px_rgba(0,0,0,0.02)]', 
                              config.bg, config.color, config.border
                            )}>
                              {config.label}
                            </span>
                            
                            {!notification.read && (
                              <span className="inline-flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-bold text-primary tracking-wide uppercase">New Update</span>
                              </span>
                            )}
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/40 dark:bg-white/5 border border-border/30 rounded-lg px-2 py-0.5">
                            <Clock size={11} className="text-muted-foreground/80" />
                            <span>{formatTime(notification.createdAt)}</span>
                          </div>
                        </div>

                        {/* Title and Message */}
                        <div className="space-y-1">
                          <h3 className="text-sm md:text-base font-bold text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors">
                            {notification.title}
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed max-w-4xl">
                            {notification.message}
                          </p>
                        </div>

                        {/* Sleek Action Footer */}
                        <div className="pt-3 mt-3 flex items-center justify-between border-t border-border/10">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(notification);
                              }}
                              className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                              <span>View context</span>
                              <ArrowUpRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" />
                            </button>
                            
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification.id);
                            }}
                            className="flex items-center gap-1 text-[11px] font-semibold text-rose-500/70 hover:text-rose-500 transition-colors md:opacity-0 md:group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedNotification && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedNotification(null)}
                className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xl"
              >
                <div className="flex items-start justify-between gap-6 mb-6">
                  <div className="space-y-2">
                     <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-[10px] font-semibold px-2.5 py-0.5 rounded border shadow-sm', 
                        getTagConfig(selectedNotification.type).bg, 
                        getTagConfig(selectedNotification.type).color, 
                        getTagConfig(selectedNotification.type).border
                      )}>
                          {getTagConfig(selectedNotification.type).label}
                      </span>
                     </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground leading-tight">{selectedNotification.title}</h2>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{new Date(selectedNotification.createdAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="rounded-xl p-2 bg-muted text-muted-foreground hover:text-rose-500 transition-all border border-border/40"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="rounded-xl bg-muted/40 dark:bg-white/[0.02] p-5 text-sm leading-relaxed text-foreground font-medium border border-border/40 mb-6">
                  {selectedNotification.message}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setSelectedNotification(null)} className="flex-1 rounded-xl font-semibold text-xs h-10 border-border/60">
                    Dismiss
                  </Button>
                  <Button className="flex-1 rounded-xl font-semibold text-xs h-10 shadow-sm shadow-primary/10">
                    Review Context
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompanyNotificationPage;
