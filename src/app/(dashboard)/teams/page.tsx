import { Users } from "lucide-react";

export default function TeamsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <Users className="h-12 w-12 text-muted-foreground/30" />
      <p className="text-sm font-medium text-muted-foreground">
        Select a team to get started
      </p>
    </div>
  );
}
