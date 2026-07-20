import { cookies } from "next/headers";
import { AuthGuard } from "@/components/auth-guard";
import { MainSidebar } from "@/components/main-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { MainSidebarProvider } from "@/components/main-sidebar-provider";
import { StoreHydrator } from "@/components/store-hydrator";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/user-menu";
import { Toaster } from "@/components/ui/sonner";
import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationProvider } from "@/providers/notification-provider";
import { Organization, OrganizationMember } from "@/types/organization";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get("accessToken")?.value;
  
  const orgCookie = cookieStore.get("currentOrganization")?.value;
  let currentOrganization: Organization | null = null;
  if (orgCookie) {
    try {
      const decodedOrg = decodeURIComponent(orgCookie);
      currentOrganization = decodedOrg.startsWith('{') ? JSON.parse(decodedOrg) as Organization : null;
    } catch {
      try {
        currentOrganization = orgCookie.startsWith('{') ? JSON.parse(orgCookie) as Organization : null;
      } catch {}
    }
  }

  const accessToken = cookieStore.get("accessToken")?.value || null;

  let organizations: Organization[] = [];
  if (accessToken) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      organizations = data.data || [];
    } catch (error) {
      console.error("Failed to fetch organizations on server", error);
    }
  }
  
  // Verify that the current organization is valid for the user
  let validatedCurrentOrganization = currentOrganization && organizations.find((org) => org.id === currentOrganization?.id) ? currentOrganization : null;
  let validatedCurrentMember: OrganizationMember | null = null;

  // Fallback: If no organization is selected but the user has organizations, select the first one
  if (!validatedCurrentOrganization && organizations.length > 0) {
    validatedCurrentOrganization = organizations[0];
  }

  // Always fetch authoritative membership and permissions for the active organization.
  if (validatedCurrentOrganization) {
    try {
      const memberResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${validatedCurrentOrganization.id}/members/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store'
      });
      if (memberResponse.ok) {
        const memberData = await memberResponse.json();
        validatedCurrentMember = memberData.data || null;
      }
    } catch (error) {
      console.error("Failed to fetch current organization membership", error);
    }
  }

  return (
    <AuthGuard initialIsAuthenticated={isAuthenticated}>
      <StoreHydrator 
        currentOrganization={validatedCurrentOrganization} 
        currentMember={validatedCurrentMember}
        organizations={organizations}
      >
        <NotificationProvider>
          <MainSidebarProvider>
            <MainSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                </div>
                <div className="ml-auto flex items-center gap-2 px-4">
                  <NotificationList />
                  <UserMenu />
                </div>
              </header>
              <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                {children}
              </div>
            </SidebarInset>
          </MainSidebarProvider>
        </NotificationProvider>
      </StoreHydrator>
      <Toaster />
    </AuthGuard>
  );
}
