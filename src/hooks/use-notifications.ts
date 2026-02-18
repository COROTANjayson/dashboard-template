import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useNotificationStore } from "@/app/store/notification.store";
import { toast } from "sonner";
import { notificationService } from "@/services/notification.service";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:3000";

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
                const data = await notificationService.getAll();
                if (data.data && Array.isArray(data.data.notifications)) {
                    setNotifications(data.data.notifications);
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
        // This handles sync across multiple tabs/devices
        // If the user marks as read in Tab A, Tab B receives this event
        markStoreRead(data.notificationId);
    });

    socket.on("all-notifications-read", () => {
       // Sync "Mark all as read" across tabs
       markStoreAllRead();
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnectionStatus(false);
    };
  }, [accessToken, setNotifications, addNotification, setUnreadCount, setConnectionStatus]);

  // Methods to emit events
  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    markStoreRead(notificationId);
    
    try {
        await notificationService.markAsRead(notificationId);
    } catch (error) {
        console.error("Failed to mark notification as read", error);
        // We could revert the optimistic update here if needed
    }
  }, [markStoreRead]);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    markStoreAllRead();

    try {
        await notificationService.markAllAsRead();
    } catch (error) {
        console.error("Failed to mark all notifications as read", error);
    }
  }, [markStoreAllRead]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
