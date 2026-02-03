"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { User } from "@/types/auth";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (data: { user: User; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  setAuth: (data: Partial<AuthState>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      login: (data) => {
        Cookies.set("accessToken", data.accessToken, { expires: 1 });
        Cookies.set("refreshToken", data.refreshToken, { expires: 30 });
        Cookies.set("user", JSON.stringify(data.user), { expires: 30 });
        set({
          isAuthenticated: true,
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      },
      logout: () => {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        Cookies.remove("user");
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },
      setUser: (user) => {
        Cookies.set("user", JSON.stringify(user), { expires: 30 });
        set({ user });
      },
      setTokens: (tokens) => {
        Cookies.set("accessToken", tokens.accessToken, { expires: 1 });
        Cookies.set("refreshToken", tokens.refreshToken, { expires: 30 });
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
      },
      setAuth: (data) => set((state) => ({ ...state, ...data })),
    }),
    {
      name: "auth-storage",
      skipHydration: true,
    }
  )
);
