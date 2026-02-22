"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { TeamsNav } from "./components/TeamsNav";
import { TeamsView } from "./components/TeamsView";
import { CreateTeamDialog } from "./components/CreateTeamDialog";
import { Team } from "@/types/team";
import { Users } from "lucide-react";

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  return (
    <div className="flex h-full gap-0">
      {/* Left: narrow avatar-only team list */}
      <aside className="flex w-14 shrink-0 flex-col items-center border-r py-4 overflow-visible gap-2">
        <TeamsNav
          selectedTeamId={selectedTeam?.id ?? null}
          onSelectTeam={setSelectedTeam}
        />
        <Separator className="mx-2 w-8" />
        <CreateTeamDialog />
      </aside>

      <Separator orientation="vertical" className="h-auto self-stretch" />

      {/* Right: page content */}
      <div className="flex flex-1 flex-col overflow-auto p-6">
        {selectedTeam ? (
          <TeamsView team={selectedTeam} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              Select a team to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
