import { cookies } from "next/headers";
import { AuthGuard } from "@/components/auth-guard";
import { StoreHydrator } from "@/components/store-hydrator";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/user-menu";
import { SettingsNav } from "@/components/settings-nav";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Organization, OrganizationMember } from "@/types/organization";

export default async function SettingsLayout({
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
