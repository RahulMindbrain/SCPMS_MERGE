import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { socket } from "./socket.config";
import { SOCKET_EVENTS } from "./socket.events";
import { toast } from "sonner";
import type { RootState } from "../redux/reducers/rootReducer";
import { addNotification as addReduxNotification } from "@/redux/slices/notificationSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store/store";

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export interface SocketContextProps {
    socket: typeof socket | null;
    notifications: NotificationItem[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextProps | null>(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, user, userType } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const addNotification = useCallback((title: string, message: string, type: string = 'SYSTEM') => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        const newNotification: NotificationItem = {
            id,
            title,
            message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false,
        };
        
        setNotifications((prev) => {
            const updated = [newNotification, ...prev];
            return updated.slice(0, 10);
        });

        // Sync with Redux for persistence across components (like AdminDashboard feed)
        dispatch(addReduxNotification({
            id,
            title,
            message,
            type,
            read: false,
            createdAt: new Date().toISOString()
        } as any));
    }, [dispatch]);

    const markAsRead = useCallback((id: string) => {
        setNotifications((prev) => 
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) => 
            prev.map(n => ({ ...n, read: true }))
        );
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (socket.connected) {
                socket.disconnect();
                console.log("❌ Socket disconnected (user logged out)");
            }
            return;
        }

        const handleConnect = () => {
            console.log("✅ Connected:", socket.id);
            socket.emit("join", {
                userId: user.id,
                role: userType,
            });
            console.log("🚪 Joined room:", `user:${user.id}`);
        };

        if (socket.connected) {
            handleConnect();
        } else {
            socket.connect();
        }

        socket.on("connect", handleConnect);

        return () => {
            socket.off("connect", handleConnect);
        };
    }, [isAuthenticated, user, userType]);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Common listeners for Admin & Company
        if (userType === 'ADMIN' || userType === 'COMPANY') {
            socket.on(SOCKET_EVENTS.NEW_APPLICATION, (data) => {
                const title = "New Job Application!";
                const message = `${data.studentName || 'A student'} applied for "${data.jobTitle || 'a position'}"`;
                toast.info(title, { description: message });
                addNotification(title, message, 'PLACEMENT');
            });

            socket.on(SOCKET_EVENTS.OFFER_ACCEPTED, (data) => {
                const title = "Offer Accepted!";
                const message = `${data.studentName} has accepted the offer for "${data.jobTitle}".`;
                toast.success(title, { description: message });
                addNotification(title, message, 'PLACEMENT');
            });
        }

        // Role-based listeners
        if (userType === 'STUDENT') {
            socket.on(SOCKET_EVENTS.APPLICATION_STATUS_UPDATED, (data) => {
                const title = "Application Update";
                const message = `Your application was ${data.status.toLowerCase()}`;
                toast.success(title, { description: message });
                addNotification(title, message, 'INTERVIEW');
            });
        }

        if (userType === 'ADMIN') {
            socket.on(SOCKET_EVENTS.NEW_USER_REGISTERED, (data) => {
                const title = "New Registration";
                const message = `New ${data.role ? data.role.toLowerCase() : 'user'} registered`;
                toast.info(title, { description: message });
                addNotification(title, message, 'SYSTEM');
            });

            socket.on(SOCKET_EVENTS.SCHEDULE_CREATED, (data) => {
                const title = "New Schedule Created";
                const message = `A new interview schedule "${data.title}" was generated.`;
                toast.info(title, { description: message });
                addNotification(title, message, 'INTERVIEW');
            });
        }

        socket.on(SOCKET_EVENTS.SYSTEM_ALERT, (data) => {
            toast.warning("System Alert", { description: data.message });
            addNotification("System Alert", data.message, 'SYSTEM');
        });

        socket.on("connect_error", (err) => {
            console.error("🔌 Socket connection error:", err.message);
        });

        return () => {
            socket.off(SOCKET_EVENTS.APPLICATION_STATUS_UPDATED);
            socket.off(SOCKET_EVENTS.NEW_APPLICATION);
            socket.off(SOCKET_EVENTS.NEW_USER_REGISTERED);
            socket.off(SOCKET_EVENTS.OFFER_ACCEPTED);
            socket.off(SOCKET_EVENTS.SYSTEM_ALERT);
            socket.off(SOCKET_EVENTS.SCHEDULE_CREATED);
            socket.off("connect_error");
        };
    }, [userType, addNotification, isAuthenticated]);

    return (
        <SocketContext.Provider value={{
            socket,
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            clearNotifications
        }}>
            {children}
        </SocketContext.Provider>
    );
};
