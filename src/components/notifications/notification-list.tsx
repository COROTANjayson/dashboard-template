"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { NotificationItem } from "./notification-item";
import { useNotificationContext } from "@/providers/notification-provider";


export function NotificationList() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 px-1 min-w-5 h-5 flex items-center justify-center rounded-full text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between font-normal">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 text-xs text-muted-foreground hover:text-primary"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  title={notification.title}
                  description={notification.message}
                  time={formatTime(notification.createdAt)}
                  read={notification.isRead}
                  onClick={() => markAsRead(notification.id)}
                />
              ))}
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator />
        <div className="p-1">
          <Button variant="ghost" className="w-full justify-center text-sm" size="sm">
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatTime(dateString: string) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return "";
    }
}
