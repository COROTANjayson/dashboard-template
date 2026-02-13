"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";
import Image from "next/image";

function getInitials(name?: string, email?: string) {
  const safeName = (name ?? "").trim();
  if (safeName) {
    const parts = safeName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
    return `${parts[0]!.slice(0, 1)}${parts[parts.length - 1]!.slice(0, 1)}`.toUpperCase();
  }

  const safeEmail = (email ?? "").trim();
  if (safeEmail) return safeEmail.slice(0, 2).toUpperCase();

  return "U";
}

export function UserMenu({ className }: { className?: string }) {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const name = user ? `${user.firstName} ${user.lastName}`.trim() : "User";
  const email = user?.email?.trim() || "";

  const initials = useMemo(() => getInitials(name, email), [name, email]);

  const handleProfile = () => {
    router.push("/profile");
  };

  const handleAccount = () => {
    router.push("/account");
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    }
    logout();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={name}
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-muted text-xs font-semibold text-foreground transition-colors hover:bg-accent">
              {initials}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email || "—"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleProfile}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAccount}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Account</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20 focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
