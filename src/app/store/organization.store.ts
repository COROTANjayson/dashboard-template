"use client";

import { create } from "zustand";
import Cookies from "js-cookie";
import {
  Organization,
  OrganizationMember,
  OrganizationMemberStatus,
  OrganizationPermission,
  Role,
} from "@/types/organization";

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  currentMember: OrganizationMember | null;
  currentRole: Role | null;
  isHydrated: boolean;
  setOrganizations: (organizations: Organization[]) => void;
  setCurrentOrganization: (
    organization: Organization | null,
    member?: OrganizationMember | null,
  ) => void;
  setHydrated: (hydrated: boolean) => void;
  clearOrganizations: () => void;
  hasPermission: (permission: OrganizationPermission) => boolean;
}

export const useOrganizationStore = create<OrganizationState>()((set, get) => ({
  organizations: [],
  currentOrganization: null,
  currentMember: null,
  currentRole: null,
  isHydrated: false,
  hasPermission: (permission) => {
    const { currentMember, currentRole: role } = get();
    if (currentMember?.status !== OrganizationMemberStatus.ACTIVE) return false;
    if (role?.name === "owner") return true;
    return role?.permissions.includes(permission) ?? false;
  },
  setOrganizations: (organizations) => set({ organizations }),
  setHydrated: (isHydrated) => set({ isHydrated }),
  setCurrentOrganization: (organization, member = null) => {
    if (typeof window !== "undefined") {
      if (organization) {
        Cookies.set("currentOrganization", JSON.stringify(organization), {
          expires: 7,
        });
      } else {
        Cookies.remove("currentOrganization");
      }

      Cookies.remove("currentRole");
    }

    set({
      currentOrganization: organization,
      currentMember: member,
      currentRole: member?.role ?? null,
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
      currentMember: null,
      currentRole: null,
    });
  },
}));
