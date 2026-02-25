export interface ChatSender {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatar: string | null;
}

export interface ChatMessage {
  id: string;
  teamId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: ChatSender;
}

export interface SendMessagePayload {
  teamId: string;
  content: string;
}
