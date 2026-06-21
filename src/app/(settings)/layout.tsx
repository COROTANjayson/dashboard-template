import { cookies } from "next/headers";
import { AuthGuard } from "@/components/auth-guard";
import { StoreHydrator } from "@/components/store-hydrator";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/user-menu";
import { SettingsNav } from "@/components/settings-nav";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get("accessToken")?.value;

  const userCookie = cookieStore.get("user")?.value;
  const user = userCookie ? JSON.parse(userCookie) : null;
  
  const orgCookie = cookieStore.get("currentOrganization")?.value;
  let currentOrganization = null;
  if (orgCookie) {
    try {
      const decodedOrg = decodeURIComponent(orgCookie);
      currentOrganization = decodedOrg.startsWith('{') ? JSON.parse(decodedOrg) : null;
    } catch (e) {
      try {
        currentOrganization = orgCookie.startsWith('{') ? JSON.parse(orgCookie) : null;
      } catch (e2) {}
    }
  }
  
  const roleCookie = cookieStore.get("currentRole")?.value;
  let currentRole = null;
  if (roleCookie) {
    try {
      const decodedRole = decodeURIComponent(roleCookie);
      currentRole = decodedRole.startsWith('{') ? JSON.parse(decodedRole) : null;
    } catch (e) {
      try {
        currentRole = roleCookie.startsWith('{') ? JSON.parse(roleCookie) : null;
      } catch (e2) {}
    }
  }

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
  let validatedCurrentOrganization = currentOrganization && organizations.find((org: any) => org.id === currentOrganization.id) ? currentOrganization : null;
  let validatedCurrentRole = validatedCurrentOrganization ? currentRole : null;

  // Fallback: If no organization is selected but the user has organizations, select the first one
  if (!validatedCurrentOrganization && organizations.length > 0) {
    validatedCurrentOrganization = organizations[0];
  }

  // Always fetch the latest role for the active organization to keep permissions in sync
  if (validatedCurrentOrganization) {
    try {
      const roleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/${validatedCurrentOrganization.id}/members/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store'
      });
      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        validatedCurrentRole = roleData.data?.role || null;
      }
    } catch (error) {
      console.error("Failed to fetch latest role for organization", error);
      // Keep the cookie role as fallback if network fails
    }
  }

  return (
    <AuthGuard initialIsAuthenticated={isAuthenticated}>
      <StoreHydrator 
        currentOrganization={validatedCurrentOrganization} 
        currentRole={validatedCurrentRole}
        organizations={organizations}
      >
        <div className="flex min-h-screen flex-col bg-background">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
               <Link 
                href="/dashboard" 
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Dashboard
              </Link>
              <Separator orientation="vertical" className="h-4" />
              <h1 className="text-lg font-semibold">Settings</h1>
            </div>
            <UserMenu />
          </header>
          
          <main className="flex-1 px-6 py-8">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-8 md:flex-row">
                <aside className="w-full md:w-64">
                   <SettingsNav />
                </aside>
                <Separator orientation="vertical" className="hidden h-auto self-stretch md:block" />
                <div className="flex-1">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </StoreHydrator>
    </AuthGuard>
  );
}
