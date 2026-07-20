"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { User } from "@/types/auth";

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  login: (user?: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setAuth: (data: Partial<AuthState>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: null,
      user: null,
      login: (user) => {
        if (user) {
          Cookies.set("user", JSON.stringify(user), { expires: 30 });
        }
        set({
          isAuthenticated: true,
          accessToken: null,
          user: user || null,
        });
      },
      logout: () => {
        Cookies.remove("user");
        Cookies.remove("currentOrganization");
        Cookies.remove("currentRole");
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
        });
      },
      setUser: (user) => {
        Cookies.set("user", JSON.stringify(user), { expires: 30 });
        set({ user });
      },
      setAuth: (data) => set((state) => ({ ...state, ...data })),
    }),
    {
      name: "auth-storage",
      skipHydration: true,
    }
  )
);
