"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

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

// Mock data for notifications
const mockNotifications = [
  {
    id: "1",
    title: "New Message",
    description: "You have a new message from Alice.",
    time: "2m ago",
    read: false,
  },
  {
    id: "2",
    title: "System Update",
    description: "System maintenance scheduled for tonight.",
    time: "1h ago",
    read: false,
  },
  {
    id: "3",
    title: "Project Invite",
    description: "You were invited to project 'Alpha'.",
    time: "3h ago",
    read: true,
  },
  {
    id: "4",
    title: "Task Assigned",
    description: "A new task has been assigned to you.",
    time: "5h ago",
    read: true,
  },
  {
    id: "5",
    title: "Welcome!",
    description: "Welcome to the new dashboard.",
    time: "1d ago",
    read: true,
  },
];

export function NotificationList() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
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
        
        {/* Scrollable container locally implemented since ScrollArea might be missing */}
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
                  description={notification.description}
                  time={notification.time}
                  read={notification.read}
                  onClick={() => console.log(`Clicked notification ${notification.id}`)}
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
