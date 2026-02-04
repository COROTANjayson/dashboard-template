import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SettingsPageContainerProps {
  children: ReactNode;
  className?: string;
}

export function SettingsPageContainer({ children, className }: SettingsPageContainerProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}
