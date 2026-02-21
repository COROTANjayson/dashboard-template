import { Separator } from "@/components/ui/separator";
import { TeamsNav } from "./components/TeamsNav";

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full gap-0">
      {/* Left: narrow avatar-only team list */}
      <aside className="flex w-14 shrink-0 flex-col items-center border-r py-4 overflow-visible">
        <TeamsNav />
      </aside>

      <Separator orientation="vertical" className="h-auto self-stretch" />

      {/* Right: page content */}
      <div className="flex flex-1 flex-col overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}
