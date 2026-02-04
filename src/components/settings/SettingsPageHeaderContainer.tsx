import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SettingsPageHeaderContainerProps {
  children: ReactNode;
  className?: string;
}

export function SettingsPageHeaderContainer({ children, className }: SettingsPageHeaderContainerProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4", className)}>
      {children}
    </div>
  );
}
