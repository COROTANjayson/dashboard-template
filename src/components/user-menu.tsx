"use client";

import { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import { cn } from "@/lib/utils";

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
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Select values separately to keep snapshots stable (avoids React 18 warning).
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const name = user?.name?.trim() || "User";
  const email = user?.email?.trim() || "";

  const initials = useMemo(() => getInitials(name, email), [name, email]);

  const close = () => {
    detailsRef.current?.removeAttribute("open");
  };

  const handleProfile = () => {
    close();
    router.push("/profile");
  };

  const handleLogout = () => {
    close();
    logout();
    router.push("/login");
  };

  return (
    <details ref={detailsRef} className={cn("relative", className)}>
      <summary className="cursor-pointer list-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-muted text-xs font-semibold text-foreground">
          {initials}
        </div>
      </summary>

      <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
        <div className="border-b px-3 py-2">
          <div className="text-sm font-medium leading-none">{name}</div>
          <div className="mt-1 truncate text-xs text-muted-foreground">{email || "—"}</div>
        </div>

        <div className="p-1">
          <button
            type="button"
            onClick={handleProfile}
            className="w-full rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
          >
            Logout
          </button>
        </div>
      </div>
    </details>
  );
}

