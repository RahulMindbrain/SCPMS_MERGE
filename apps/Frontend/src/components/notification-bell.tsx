import { Bell, Users, Briefcase, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/socket/SocketProvider";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import type { AppDispatch } from "@/redux/store/store";
import type { RootState } from "@/redux/reducers/rootReducer";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/redux/thunks/notificationThunks";
import useAuth from "@/redux/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const dispatch = useDispatch<AppDispatch>();
  const { userType } = useAuth();
  const navigate = useNavigate();
  const apiUnreadCount = useSelector((state: RootState) => state.notification.unreadCount);
  const apiNotifications = useSelector((state: RootState) => state.notification.items);
  const isLoggedIn = !!userType;

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUnreadCount());
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }
  }, [dispatch, isLoggedIn]);

  const mappedApiNotifications = apiNotifications.map((notification) => ({
    id: notification.id,
    title: notification.title || "Notification",
    message: notification.message || "No message available.",
    timestamp: notification.createdAt
      ? new Date(notification.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "",
    read: notification.read,
  }));

  const displayedNotifications = mappedApiNotifications.length > 0 ? mappedApiNotifications : notifications;
  const displayedUnreadCount = mappedApiNotifications.length > 0 ? apiUnreadCount : unreadCount;
  const notificationsPagePath =
    userType === "ADMIN"
      ? "/admin/notification"
      : userType === "COMPANY"
        ? "/company/notifications"
        : "/student/notifications";

  const totalUnreadCount = Math.max(unreadCount, apiUnreadCount);

  // Dynamic context inspector to dynamically assign icons & styled badges to notifications inside header preview
  const getNotificationConfig = (title: string, message: string) => {
    const text = (title + " " + message).toLowerCase();
    if (text.includes("applicant") || text.includes("candidate") || text.includes("apply") || text.includes("applied")) {
      return {
        icon: Users,
        color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100/40 dark:border-indigo-500/20",
      };
    }
    if (text.includes("interview") || text.includes("schedule") || text.includes("slot")) {
      return {
        icon: Clock,
        color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100/40 dark:border-amber-500/20",
      };
    }
    if (text.includes("job") || text.includes("drive") || text.includes("position")) {
      return {
        icon: Briefcase,
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100/40 dark:border-emerald-500/20",
      };
    }
    return {
      icon: Bell,
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100/40 dark:border-blue-500/20",
    };
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-xl bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-all duration-300 border border-border/40 hover:border-border/80 active:scale-95 shadow-sm"
        >
          <Bell className={cn("h-[18px] w-[18px] transition-transform", totalUnreadCount > 0 && "animate-[bell-swing_2s_infinite]")} />
          {totalUnreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white border-2 border-background shadow-md animate-in zoom-in duration-300">
              {totalUnreadCount > 9 ? "9+" : totalUnreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[360px] p-0 overflow-hidden rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-3 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-xs text-foreground tracking-tight">Notifications</h3>
            {totalUnreadCount > 0 && (
              <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider border border-rose-500/10">
                {totalUnreadCount} unread
              </span>
            )}
          </div>
          {displayedUnreadCount > 0 && (
            <button
              className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer"
              onClick={() => {
                dispatch(markAllNotificationsAsRead());
                markAllAsRead();
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[380px] overflow-y-auto no-scrollbar">
          {displayedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center group">
              <div className="h-12 w-12 rounded-xl bg-muted/65 flex items-center justify-center mb-3 transition-transform group-hover:scale-110 duration-500 shadow-inner">
                <Bell className="h-6 w-6 text-muted-foreground/60 opacity-40 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-foreground tracking-tight">All caught up!</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium max-w-[200px]">You have no new notifications at this time.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/40">
              {displayedNotifications.map((notification) => {
                const config = getNotificationConfig(notification.title, notification.message);
                const ItemIcon = config.icon;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "relative p-4 flex gap-3 cursor-pointer transition-all duration-200 hover:bg-muted/40 group",
                      !notification.read ? "bg-gradient-to-r from-primary/5 via-transparent to-transparent" : ""
                    )}
                    onClick={async () => {
                      if (!notification.read) {
                        await dispatch(markNotificationAsRead(Number(notification.id)));
                        dispatch(fetchUnreadCount());
                        markAsRead(String(notification.id));
                      }
                      navigate(notificationsPagePath);
                    }}
                  >
                    {/* Unread dot indicator */}
                    {!notification.read && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}

                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-sm transition-all duration-300 group-hover:scale-105",
                      config.color
                    )}>
                      <ItemIcon size={16} strokeWidth={2.2} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                          "text-xs truncate transition-colors leading-tight", 
                          !notification.read ? "font-bold text-foreground" : "font-semibold text-muted-foreground"
                        )}>
                          {notification.title}
                        </p>
                        <span className="text-[9px] font-semibold text-muted-foreground/50 whitespace-nowrap shrink-0 uppercase">
                          {notification.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground/80 font-medium line-clamp-1 leading-normal group-hover:text-muted-foreground transition-colors">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer link */}
        <div className="p-3 bg-muted/20 border-t border-border/50">
          <button
            onClick={() => navigate(notificationsPagePath)}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-semibold shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            Open Full Center
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
