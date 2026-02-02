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
  const currentOrganization = orgCookie ? JSON.parse(orgCookie) : null;

  return (
    <AuthGuard initialIsAuthenticated={isAuthenticated}>
      <StoreHydrator user={user} currentOrganization={currentOrganization}>
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
