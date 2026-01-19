import { AuthGuard } from "@/components/auth-guard";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex">
        <Sidebar />
        <main className="ml-64 flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
