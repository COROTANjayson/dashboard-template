"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/app/store/auth.store";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";

export function Navbar({ initialIsAuthenticated }: { initialIsAuthenticated?: boolean }) {
  const storeIsAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Rehydrate store on mount
    useAuthStore.persist.rehydrate();
    setMounted(true);
  }, []);

  // Use prop on server/first-render, then store thereafter
  const isAuthenticated = mounted ? storeIsAuthenticated : initialIsAuthenticated;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Logo on the left */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">MyApp</span>
        </Link>

        {/* Login and Sign Up buttons on the right */}
        <div className="flex items-center gap-4 ">
          {isAuthenticated ? (
            <>
              <Button variant="default" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <UserMenu />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
