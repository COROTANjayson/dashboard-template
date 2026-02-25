"use client";

import { useParams } from "next/navigation";
import { ChatArea } from "@/components/chat/chat-area";

export default function TeamChatGeneralPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b pb-4 mb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">General Chat</h1>
        <p className="text-muted-foreground mt-1">
          Discuss general topics with your team.
        </p>
      </div>
      <div className="flex-1 overflow-hidden min-h-0">
        <ChatArea teamId={teamId} />
      </div>
    </div>
  );
}
