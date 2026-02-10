import { cookies } from "next/headers";
import { AuthGuard } from "@/components/auth-guard";
import { MainSidebar } from "@/components/main-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { MainSidebarProvider } from "@/components/main-sidebar-provider";
import { StoreHydrator } from "@/components/store-hydrator";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/user-menu";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get("accessToken")?.value;
  
  const userCookie = cookieStore.get("user")?.value;
  const user = userCookie ? JSON.parse(userCookie) : null;
  
  const orgCookie = cookieStore.get("currentOrganization")?.value;
  const currentOrganization = orgCookie ? JSON.parse(orgCookie) : null;
  
  const roleCookie = cookieStore.get("currentRole")?.value;
  const currentRole = (roleCookie || null) as any;

  const accessToken = cookieStore.get("accessToken")?.value || null;

  let organizations = [];
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
  const validatedCurrentOrganization = currentOrganization && organizations.find((org: any) => org.id === currentOrganization.id) 
    ? currentOrganization 
    : null;
    
  // If we invalidated the org, we should also invalidate the role unless we can re-verify it (which we can't easily here without another call)
  // Logic: if validatedCurrentOrganization is null, role should probably be null too.
  const validatedCurrentRole = validatedCurrentOrganization ? currentRole : null;

  return (
    <AuthGuard initialIsAuthenticated={isAuthenticated}>
      <StoreHydrator 
        currentOrganization={validatedCurrentOrganization} 
        currentRole={validatedCurrentRole}
        organizations={organizations}
      >
        <MainSidebarProvider>
          <MainSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            <div className="ml-auto flex items-center gap-2 px-4">
              <UserMenu />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
             {children}
          </div>
        </SidebarInset>
      </MainSidebarProvider>
      </StoreHydrator>
      <Toaster />
    </AuthGuard>
  );
}
