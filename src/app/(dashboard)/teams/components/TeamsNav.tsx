"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// Hardcoded team list — API integration comes later
const TEAMS = [
  { id: "1", name: "Frontend" },
  { id: "2", name: "Backend" },
  { id: "3", name: "Design" },
  { id: "4", name: "QA" },
  { id: "5", name: "Marketing" },
];

// Deterministic color palette based on team initial index
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
  const index = parseInt(id, 10) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function TeamsNav() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {TEAMS.map((team) => {
        const isActive = selectedId === team.id;
        return (
          <div key={team.id} className="group relative flex justify-center">
            <button
              onClick={() => setSelectedId(team.id)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                isActive
                  ? "ring-2 ring-primary ring-offset-2"
                  : "hover:opacity-80"
              )}
            >
              {/* Avatar box with initials */}
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white",
                  getColor(team.id)
                )}
              >
                {getInitials(team.name)}
              </span>
            </button>
            {/* Hover tooltip with caret */}
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 flex items-center opacity-0 transition-opacity group-hover:opacity-100">
              {/* Arrow caret */}
              <span className="border-y-[6px] border-r-[7px] border-y-transparent border-r-popover drop-shadow-sm" />
              {/* Label bubble */}
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
