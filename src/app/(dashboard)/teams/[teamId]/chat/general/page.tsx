"use client";

import { useParams } from "next/navigation";
import { MessageSquare } from "lucide-react";

export default function TeamChatGeneralPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold tracking-tight">General Chat</h1>
        <p className="text-muted-foreground mt-1">
          Discuss general topics with your team.
        </p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium">Chat coming soon</h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-2">
          Real-time chat functionality is planned for this section. Stay tuned!
        </p>
      </div>
    </div>
  );
}
