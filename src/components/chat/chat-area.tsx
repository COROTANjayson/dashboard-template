"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Loader2 } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { useOrganizationStore } from "@/app/store/organization.store";
import { chatService } from "@/services/chat.service";
import { ChatMessage } from "@/types/chat";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatAreaProps {
  teamId: string;
}

export function ChatArea({ teamId }: ChatAreaProps) {
  const { accessToken, user } = useAuthStore();
  const currentOrg = useOrganizationStore((state) => state.currentOrganization);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load initial history
  useEffect(() => {
    async function loadHistory() {
      if (!currentOrg?.id || !teamId) return;
      try {
        setIsLoading(true);
        // Getting latest 50 messages
        const data = await chatService.getMessages(currentOrg.id, teamId);
        // Reverse because REST returns newest first, but chat UI needs oldest first
        setMessages(data.reverse());
      } catch (err: unknown) {
        console.error("Failed to load history:", err);
        setError("Could not load messages.");
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [currentOrg?.id, teamId]);

  // Handle Socket.IO connection
  useEffect(() => {
    if (!accessToken) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
    const socketUrl = new URL(apiUrl).origin + "/chat";

    const socket = io(socketUrl, {
      auth: { token: accessToken },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to chat", socket.id);
      socket.emit("join-team", { teamId });
      setError(null);
    });

    socket.on("error", (err: unknown) => {
      console.error("Chat socket error:", err);
      // @ts-ignore - socket error type differs depending on event
      setError(err?.message || "Socket error");
    });

    socket.on("joined-team", (data) => {
      console.log("Joined team room:", data.teamId);
    });

    socket.on("new-message", (message: ChatMessage) => {
      setMessages((prev) => {
        // Avoid duplicate if it's our own message just acknowledged
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socket.on("message-sent", (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      socket.emit("leave-team", { teamId });
      socket.disconnect();
    };
  }, [teamId, accessToken]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !socketRef.current) return;

    socketRef.current.emit("send-message", {
      teamId,
      content: inputValue.trim(),
    });
    setInputValue("");
  };

  const formatTime = (isoDate: string) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(isoDate));
  };

  const getInitials = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName.substring(0, 2).toUpperCase();
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden border rounded-lg bg-background">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full text-destructive text-sm">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className="flex gap-4 flex-row py-1"
                >
                  <Avatar className="w-10 h-10 border mt-0.5">
                    <AvatarImage src={msg.sender.avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(msg.sender.firstName, msg.sender.lastName, msg.sender.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-[15px] font-semibold text-foreground">
                        {isMine
                          ? "You"
                          : `${msg.sender.firstName || ""} ${msg.sender.lastName || ""}`.trim() ||
                            msg.sender.email}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                    <div className="text-[15px] leading-relaxed wrap-break-word text-foreground">
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t bg-card">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-background"
            disabled={!socketRef.current?.connected}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || !socketRef.current?.connected}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
