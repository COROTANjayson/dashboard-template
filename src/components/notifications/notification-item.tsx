import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  title: string;
  description: string;
  time: string;
  read?: boolean;
  onClick?: () => void;
  actions?: React.ReactNode;
}

export function NotificationItem({
  title,
  description,
  time,
  read = false,
  onClick,
  actions,
}: NotificationItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-start gap-3 border-b p-4 transition-colors last:border-0 hover:bg-muted/50",
        !read && "bg-muted/20"
      )}
    >
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Bell className="h-4 w-4" />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("text-sm font-medium leading-none", !read && "font-semibold")}>
            {title}
          </p>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {description}
        </p>
        {actions && <div className="mt-2" onClick={(e) => e.stopPropagation()}>{actions}</div>}
      </div>
      {!read && (
        <span className="mt-1 block h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </div>
  );
}
