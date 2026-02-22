"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { useOrganizationStore } from "@/app/store/organization.store";
import { fetchTeams } from "@/services/team.service";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Refined gradient palette for a premium feel
const AVATAR_GRADIENTS = [
  "bg-gradient-to-br from-violet-500 to-purple-600",
  "bg-gradient-to-br from-blue-500 to-indigo-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-orange-400 to-rose-500",
  "bg-gradient-to-br from-rose-500 to-pink-600",
  "bg-gradient-to-br from-cyan-400 to-blue-500",
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-pink-500 to-fuchsia-600",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

export function TeamsNav() {
  const { currentOrganization } = useOrganizationStore();
  const router = useRouter();
  const params = useParams();
  const activeTeamId = params?.teamId as string | undefined;

  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams", currentOrganization?.id],
    queryFn: () => fetchTeams(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
  });

  if (isLoading) {
    return (
      <nav className="flex flex-col gap-2 px-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-center">
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        ))}
      </nav>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <nav className="flex flex-col gap-2 px-1.5">
        <p className="py-2 text-center text-[10px] text-muted-foreground">
          No teams
        </p>
      </nav>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex flex-col gap-2 px-1.5">
        {teams.map((team) => {
          const isActive = activeTeamId === team.id;
          return (
            <div key={team.id} className="relative flex items-center justify-center">
              {/* Active indicator — left pill */}
              <span
                className={cn(
                  "absolute -left-1.5 w-1 rounded-r-full bg-primary transition-all duration-200",
                  isActive
                    ? "h-5 opacity-100"
                    : "h-0 opacity-0 group-hover:h-2 group-hover:opacity-100",
                )}
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => router.push(`/teams/${team.id}`)}
                    className="group relative flex items-center justify-center"
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center text-xs font-bold text-white transition-all duration-200",
                        getGradient(team.id),
                        isActive
                          ? "rounded-xl shadow-lg"
                          : "rounded-2xl opacity-80 hover:rounded-xl hover:opacity-100 hover:shadow-md",
                      )}
                    >
                      {getInitials(team.name)}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  <p className="font-medium">{team.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
