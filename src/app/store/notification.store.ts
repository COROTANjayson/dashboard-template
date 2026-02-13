import { create } from "zustand";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setUnreadCount: (count: number) => void;
  setConnectionStatus: (status: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,

  setNotifications: (notifications) => set({ notifications }),
  
  addNotification: (notification) => 
    set((state) => ({ 
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1 
    })),
    
  markRead: (id) => 
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (notification && !notification.isRead) {
        return {
          notifications: state.notifications.map((n) => 
            n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        };
      }
      return state;
    }),
    
  markAllRead: () => 
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
      unreadCount: 0
    })),
    
  setUnreadCount: (count) => set({ unreadCount: count }),
  
  setConnectionStatus: (status) => set({ isConnected: status }),
}));
