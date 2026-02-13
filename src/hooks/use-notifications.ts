import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useNotificationStore } from "@/app/store/notification.store";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const SOCKET_URL = API_URL.replace("/api/v1", "");

export function useNotifications(accessToken: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const {
    notifications,
    unreadCount,
    setNotifications,
    addNotification,
    markRead: markStoreRead,
    markAllRead: markStoreAllRead,
    setUnreadCount,
    setConnectionStatus,
  } = useNotificationStore();

    useEffect(() => {
        if (!accessToken) return;

        const fetchNotifications = async () => {
            try {
                const response = await fetch(`${API_URL}/notifications`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const data = await response.json();
                if (data.success && data.data && Array.isArray(data.data.notifications)) {
                    setNotifications(data.data.notifications);
                    // Also set unread count if available or calculate it
                    // The API response for list might not include count, but we have a separate event for that.
                    // However, we can calculate it from the list or wait for the socket event.
                    // Better to rely on the socket for unread count to be accurate.
                }
            } catch (error) {
                console.error("Failed to fetch initial notifications", error);
            }
        };

        fetchNotifications();
    }, [accessToken, setNotifications]);

    useEffect(() => {
    if (!accessToken) {
        setConnectionStatus(false);
        return;
    }

    // Connect to the /notifications namespace
    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token: accessToken },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket"], // Force websocket to avoid polling issues
    });

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("Connected to notifications");
      setConnectionStatus(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from notifications");
      setConnectionStatus(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Notification connection error:", err.message);
      setConnectionStatus(false);
    });

    // Notification events
    socket.on("new-notification", (notification: any) => {
      addNotification(notification);
      toast.info(notification.title, {
        description: notification.message,
      });
    });

    socket.on("unread-count", (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    socket.on("notification-read", (data: { notificationId: string }) => {
        // Logic handled in optimistic update, but can sync here if needed
    });

    socket.on("all-notifications-read", () => {
       // Logic handled in optimistic update
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnectionStatus(false);
    };
  }, [accessToken, setNotifications, addNotification, setUnreadCount, setConnectionStatus]);

  // Methods to emit events
  const markAsRead = useCallback((notificationId: string) => {
    // Optimistic update
    markStoreRead(notificationId);
    socketRef.current?.emit("mark-as-read", { notificationId });
  }, [markStoreRead]);

  const markAllAsRead = useCallback(() => {
    // Optimistic update
    markStoreAllRead();
    socketRef.current?.emit("mark-all-read");
  }, [markStoreAllRead]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
