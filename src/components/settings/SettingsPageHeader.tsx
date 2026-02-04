import { cn } from "@/lib/utils";

interface SettingsPageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function SettingsPageHeader({ title, description, className }: SettingsPageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
        {title}
      </h1>
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
