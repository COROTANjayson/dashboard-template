"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/app/store/auth.store";
import { authService } from "@/services/auth.service";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const { data: user, isError } = useQuery({
    queryKey: ["me"],
    queryFn: authService.getMe,
    enabled: isAuthenticated, // Now safe to use directly
    retry: false,
  });

  useEffect(() => {
    if (user) {
      setUser(user); 
    }
  }, [user, setUser]);

  useEffect(() => {
    if (isError) {
      const error = isError as any;
      if (error.response?.status === 401) {
        logout();
      }
    }
  }, [isError, logout]);

  return <>{children}</>;
}
