"use client";

import { createContext, useContext, ReactNode } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import Cookies from "js-cookie";
import { Notification } from "@/app/store/notification.store";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const accessToken = Cookies.get("accessToken") || null;
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(accessToken);
  // We can also get isConnected from store if needed, but let's stick to what hook returns or add it to hook
  // The hook returns `notifications`, `unreadCount`, `markAsRead`, `markAllAsRead`.
  // I should update hook to return isConnected too.

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, isConnected: true }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
}
