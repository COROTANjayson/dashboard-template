"use client";

import { useQuery } from "@tanstack/react-query";
import { useOrganizationStore } from "@/app/store/organization.store";
import { fetchTeams } from "@/services/team.service";
import { Team } from "@/types/team";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Deterministic color palette based on string hash
const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-pink-500",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

interface TeamsNavProps {
  selectedTeamId: string | null;
  onSelectTeam: (team: Team) => void;
}

export function TeamsNav({ selectedTeamId, onSelectTeam }: TeamsNavProps) {
  const { currentOrganization } = useOrganizationStore();

  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams", currentOrganization?.id],
    queryFn: () => fetchTeams(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
  });

  if (isLoading) {
    return (
      <nav className="flex flex-col gap-0.5 px-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-center">
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        ))}
      </nav>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <nav className="flex flex-col gap-0.5 px-2">
        <p className="py-2 text-center text-[10px] text-muted-foreground">
          No teams
        </p>
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {teams.map((team) => {
        const isActive = selectedTeamId === team.id;
        return (
          <div key={team.id} className="group relative flex justify-center">
            <button
              onClick={() => onSelectTeam(team)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                isActive
                  ? "ring-2 ring-primary ring-offset-2"
                  : "hover:opacity-80",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white",
                  getColor(team.id),
                )}
              >
                {getInitials(team.name)}
              </span>
            </button>
            {/* Hover tooltip with caret */}
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 flex items-center opacity-0 transition-opacity group-hover:opacity-100">
              <span className="border-y-[6px] border-r-[7px] border-y-transparent border-r-popover drop-shadow-sm" />
              <span className="whitespace-nowrap rounded-md bg-popover px-3 py-1.5 text-sm font-medium text-popover-foreground shadow-md">
                {team.name}
              </span>
            </span>
          </div>
        );
      })}
    </nav>
  );
}
