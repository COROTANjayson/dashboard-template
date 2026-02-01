"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      setIsOpen: (isOpen) => set({ isOpen }),
      toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "sidebar-storage",
    }
  )
);
