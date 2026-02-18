import { cookies } from "next/headers";
import { AuthGuard } from "@/components/auth-guard";
import { Toaster } from "@/components/ui/sonner";

export default async function AuthenticatedPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthenticated = !!cookieStore.get("accessToken")?.value;

  return (
    <AuthGuard initialIsAuthenticated={isAuthenticated}>
      <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
        {children}
      </div>
      <Toaster />
    </AuthGuard>
  );
}
