"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import { Organization, OrganizationRole, Role } from "@/types/organization";

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  currentRole: Role | null;
  isHydrated: boolean;
  setOrganizations: (organizations: Organization[]) => void;
  setCurrentOrganization: (organization: Organization | null, role?: Role) => void;
  setHydrated: (hydrated: boolean) => void;
  clearOrganizations: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useOrganizationStore = create<OrganizationState>()((set, get) => ({
  organizations: [],
  currentOrganization: null,
  currentRole: null,
  isHydrated: false,
  hasPermission: (permission: string) => {
    const role = get().currentRole;
    if (role?.name === 'owner') return true;
    return role?.permissions?.includes(permission) ?? false;
  },
  setOrganizations: (organizations) => set({ organizations }),
  setHydrated: (isHydrated) => set({ isHydrated }),
  setCurrentOrganization: (organization, role) => {
    if (typeof window !== "undefined") {
      if (organization) {
        Cookies.set("currentOrganization", JSON.stringify(organization), { expires: 7 });
      } else {
        Cookies.remove("currentOrganization");
      }

      if (role) {
        Cookies.set("currentRole", JSON.stringify(role), { expires: 7 });
      } else {
        Cookies.remove("currentRole");
      }
    }

    set({ 
      currentOrganization: organization, 
      currentRole: role || null 
    });
  },
  clearOrganizations: () => {
    if (typeof window !== "undefined") {
      Cookies.remove("currentOrganization");
      Cookies.remove("currentRole");
    }
    set({ 
      organizations: [], 
      currentOrganization: null,
      currentRole: null
    });
  },
}));
