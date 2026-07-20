import { ShieldAlert } from "lucide-react";

interface AccessDeniedProps {
  description: string;
}

export function AccessDenied({ description }: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <ShieldAlert className="mb-4 h-12 w-12 text-destructive" />
      <h2 className="text-2xl font-bold">Access Denied</h2>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}
