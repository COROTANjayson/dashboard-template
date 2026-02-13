"use client";

import { ChevronsUpDown, LayoutDashboard, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useOrganizationStore } from "@/app/store/organization.store";
import { fetchCurrentMember } from "@/services/organization.service";
import { CreateOrganizationDialog } from "@/components/create-organization-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar();
  const {
    organizations,
    currentOrganization,
    setCurrentOrganization,
    isHydrated,
  } = useOrganizationStore();
  const handleOrgChange = async (org: any) => {
    try {
      const member = await fetchCurrentMember(org.id);
      setCurrentOrganization(org, member.role);
    } catch (error) {
      console.error("Failed to fetch organization role", error);
      setCurrentOrganization(org);
    }
  };

  if (!isHydrated) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Skeleton className="aspect-square size-8 rounded-lg" />
            <div className="grid flex-1 gap-1 px-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="ml-auto size-4" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!currentOrganization) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <CreateOrganizationDialog>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Plus className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  Create Organization
                </span>
                <span className="truncate text-xs">
                  No organization selected
                </span>
              </div>
            </SidebarMenuButton>
          </CreateOrganizationDialog>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const activeOrg = currentOrganization;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LayoutDashboard className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeOrg.name}</span>
                <span className="truncate text-xs">
                  {(activeOrg as any).slug}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Organizations
            </DropdownMenuLabel>
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleOrgChange(org)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <LayoutDashboard className="size-4 shrink-0" />
                </div>
                <span className="flex-1 truncate">{org.name}</span>
              </DropdownMenuItem>
            ))}
            {organizations.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No organizations found
              </div>
            )}
            <DropdownMenuSeparator />
            <CreateOrganizationDialog>
              <DropdownMenuItem
                className="gap-2 p-2 cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Add organization
                </div>
              </DropdownMenuItem>
            </CreateOrganizationDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
