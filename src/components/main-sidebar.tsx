"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Server, Users, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useOrganizationStore } from "@/app/store/organization.store";
import { OrganizationRole } from "@/types/organization";
import { fetchTeams } from "@/services/team.service";
import { CreateTeamDialog } from "@/app/(dashboard)/teams/components/CreateTeamDialog";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/service", label: "Service", icon: Server },
];

const adminNavItems = [
  { href: "/members", label: "Members", icon: Users },
];

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

export function MainSidebar() {
  const pathname = usePathname();
  const { currentOrganization, currentRole, isHydrated } = useOrganizationStore();

  const canSeeAdmin = isHydrated && (currentRole === OrganizationRole.OWNER || currentRole === OrganizationRole.ADMIN);

  const { data: teams, isLoading: isTeamsLoading } = useQuery({
    queryKey: ["teams", currentOrganization?.id],
    queryFn: () => fetchTeams(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isHydrated && currentOrganization && (
          <SidebarGroup>
            <SidebarGroupLabel>Teams</SidebarGroupLabel>
            <CreateTeamDialog
              trigger={
                <SidebarGroupAction asChild title="Create Team">
                  <button>
                    <Plus /> <span className="sr-only">Create Team</span>
                  </button>
                </SidebarGroupAction>
              }
            />
            <SidebarGroupContent>
              <SidebarMenu>
                {isTeamsLoading ? (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                  </>
                ) : teams?.length === 0 ? (
                  <div className="px-2 py-2 text-xs text-muted-foreground">
                    No teams yet.
                  </div>
                ) : (
                  teams?.map((team) => {
                    const href = `/teams/${team.id}`;
                    const isActive = pathname.startsWith(href);
                    return (
                      <SidebarMenuItem key={team.id}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={team.name}>
                          <Link href={href}>
                            <span
                              className={cn(
                                "flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white shadow-sm",
                                getGradient(team.id)
                              )}
                            >
                              {getInitials(team.name)}
                            </span>
                            <span className="truncate">{team.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!isHydrated ? (
          <SidebarGroup>
            <SidebarGroupLabel>
              <Skeleton className="h-4 w-16" />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <Skeleton className="size-5 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : canSeeAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
