import api from "@/lib/api";

type Notification = any; // Replace 'any' with the actual Notification type if available.

interface GetNotificationsResponse {
  notifications: Notification[];
  total: number;
}

interface UnreadCountResponse {
  count: number;
}

export const notificationService = {
  getAll: async () => {
    const response = await api.get<{ data: GetNotificationsResponse }>("/notifications");
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get<{ data: UnreadCountResponse }>("/notifications/unread-count");
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  },

  delete: async (notificationId: string) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },
};
