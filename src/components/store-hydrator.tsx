"use client";

import { useEffect, useRef } from "react";
import { useOrganizationStore } from "@/app/store/organization.store";
import { Organization, OrganizationMember } from "@/types/organization";

interface StoreHydratorProps {
  currentOrganization: Organization | null;
  currentMember: OrganizationMember | null;
  organizations: Organization[];
  children: React.ReactNode;
}

export function StoreHydrator({
  currentOrganization,
  currentMember,
  organizations,
  children,
}: StoreHydratorProps) {
  const hasHydrated = useRef(false);
  const { 
    setCurrentOrganization, 
    setOrganizations,
    setHydrated,
  } = useOrganizationStore();

  // Synchronize store with server data after mount to avoid "setState during render" warnings.
  // This also allows skeletons to show during the initial client-side mount.
  useEffect(() => {
    if (!hasHydrated.current) {
      setOrganizations(organizations);
      setCurrentOrganization(currentOrganization, currentMember);
      
      // Mark as hydrated
      setHydrated(true);
      hasHydrated.current = true;
    }
  }, [
    currentOrganization, 
    currentMember,
    organizations, 
    setCurrentOrganization, 
    setOrganizations, 
    setHydrated, 
  ]);

  return <>{children}</>;
}
