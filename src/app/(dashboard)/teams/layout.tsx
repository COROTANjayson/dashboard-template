"use client";

import { useParams } from "next/navigation";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { TeamSidebar } from "@/components/team-sidebar";

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const teamId = params.teamId as string;

  // Render standard layout if teamId is not present (e.g. at /teams index page)
  if (!teamId) {
    return (
      <div className="flex h-full flex-col overflow-auto p-6">
        {children}
      </div>
    );
  }

  return (
    <div className="h-full border rounded-xl overflow-hidden bg-background shadow-sm">
      <ResizablePanelGroup orientation="horizontal" className="h-[calc(100vh-6rem)] md:h-[calc(100vh-5.5rem)] items-stretch">
        <ResizablePanel defaultSize="20" minSize="15" maxSize="30">
          <TeamSidebar teamId={teamId} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="80">
          <div className="flex h-full flex-col overflow-y-auto p-6">
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
