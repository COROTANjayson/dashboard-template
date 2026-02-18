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


import { useRouter } from "next/navigation";

export function NotificationList() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationContext();
  const router = useRouter();

  const handleRedirect = (notificationId: string, url: string) => {
      markAsRead(notificationId);
      router.push(url);
  };

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
        
        <div className="max-h-75 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => {
                  const actionUrl = notification.metadata?.actionUrl || (notification.metadata?.token ? `/invites/accept?token=${notification.metadata.token}` : null);

                  return (
                    <NotificationItem
                      key={notification.id}
                      title={notification.title}
                      description={notification.message}
                      time={timeAgo(notification.createdAt)}
                      read={notification.isRead}
                      onClick={() => markAsRead(notification.id)}
                      actions={
                        (notification.type === 'ORGANIZATION_INVITE' || notification.type === 'MEMBER_INVITE') && !notification.isRead && actionUrl ? (
                            <Button
                                size="sm"
                                className="w-full mt-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRedirect(notification.id, actionUrl);
                                }}
                            >
                                View Invitation
                            </Button>
                        ) : null
                      }
                    />
                  );
              })}
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

function timeAgo(dateString: string | Date | undefined) {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }
        
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (seconds < 60) {
            return "just now";
        }
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return `${minutes}m ago`;
        }
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
             return `${hours}h ago`;
        }
        
        const days = Math.floor(hours / 24);
        if (days < 7) {
            return `${days}d ago`;
        }
        
        return date.toLocaleDateString();
    } catch (e) {
        return "";
    }
}
