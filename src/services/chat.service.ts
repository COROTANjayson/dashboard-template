import api from "@/lib/api";
import { ApiResponse } from "@/types/auth";
import { ChatMessage } from "@/types/chat";

export const chatService = {
  getMessages: async (orgId: string, teamId: string, cursor?: string, limit: number = 50) => {
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (limit) params.set("limit", limit.toString());

    // backend REST endpoint uses /chat/:orgId/teams/:teamId/messages
    const response = await api.get<ApiResponse<ChatMessage[]>>(
      `/chat/${orgId}/teams/${teamId}/messages?${params.toString()}`
    );
    return response.data.data;
  },
};
