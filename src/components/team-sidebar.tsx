"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Users, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useOrganizationStore } from "@/app/store/organization.store";
import { fetchTeam } from "@/services/team.service";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TeamSidebarProps {
  teamId: string;
}

export function TeamSidebar({ teamId }: TeamSidebarProps) {
  const pathname = usePathname();
  const { currentOrganization } = useOrganizationStore();

  const { data: team, isLoading } = useQuery({
    queryKey: ["team", currentOrganization?.id, teamId],
    queryFn: () => fetchTeam(currentOrganization!.id, teamId),
    enabled: !!currentOrganization?.id && !!teamId,
  });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const navGroups = [
    {
      items: [
        {
          title: "Dashboard",
          icon: LayoutDashboard,
          href: `/teams/${teamId}`,
          exact: true,
        },
      ]
    },
    {
      title: "Chat",
      items: [
        {
          title: "General",
          icon: MessageSquare,
          href: `/teams/${teamId}/chat/general`,
        },
      ]
    },
    {
      title: "Settings",
      items: [
        {
          title: "Members",
          icon: Users,
          href: `/teams/${teamId}/settings/members`,
        },
        {
          title: "Team Info",
          icon: Settings,
          href: `/teams/${teamId}/settings/info`,
        },
      ]
    }
  ];

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="p-4 border-b flex items-center gap-3 bg-muted/30 overflow-hidden">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-5 w-32" />
          </>
        ) : team ? (
          <>
            <Avatar className="h-8 w-8 rounded-md shrink-0">
              <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs font-semibold">
                {getInitials(team.name)}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold truncate text-sm">{team.name}</span>
          </>
        ) : (
          <span className="font-semibold text-muted-foreground text-sm">Team not found</span>
        )}
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="flex flex-col gap-6 px-3">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="flex flex-col gap-1">
              {group.title && (
                <div className="px-3 py-1 mb-1 text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">
                  {group.title}
                </div>
              )}
              {group.items.map((item, index) => {
                const isActive = 'exact' in item && item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
