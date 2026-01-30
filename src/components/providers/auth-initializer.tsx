"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/app/store/auth.store";

interface AuthInitializerProps {
  isAuthenticated: boolean;
  accessToken: string | null;
}

export default function AuthInitializer({ isAuthenticated, accessToken }: AuthInitializerProps) {
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    // Sync store with cookie-based state and rehydrate
    useAuthStore.persist.rehydrate();
    setAuth({
      isAuthenticated,
      accessToken,
    });
  }, [isAuthenticated, accessToken, setAuth]);

  return null;
}
