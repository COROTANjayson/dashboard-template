import { cookies } from "next/headers";
import { AuthGuard } from "@/components/auth-guard";
import { MainSidebar } from "@/components/main-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { MainSidebarProvider } from "@/components/main-sidebar-provider";
import { StoreHydrator } from "@/components/store-hydrator";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/user-menu";

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

  return (
    <AuthGuard initialIsAuthenticated={isAuthenticated}>
      <StoreHydrator user={user} currentOrganization={currentOrganization}>
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
    </AuthGuard>
  );
}
