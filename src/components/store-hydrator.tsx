"use client";

import { useEffect, useRef } from "react";
import { useOrganizationStore } from "@/app/store/organization.store";
import { Organization, OrganizationRole, Role } from "@/types/organization";

interface StoreHydratorProps {
  currentOrganization: Organization | null;
  currentRole: Role | null;
  organizations: Organization[];
  children: React.ReactNode;
}

export function StoreHydrator({
  currentOrganization,
  currentRole,
  organizations,
  children,
}: StoreHydratorProps) {
  const hasHydrated = useRef(false);
  const { 
    setCurrentOrganization, 
    setOrganizations,
    setHydrated,
    currentOrganization: storedOrg, 
    currentRole: storedRole,
    organizations: storedOrgs
  } = useOrganizationStore();

  // Synchronize store with server data after mount to avoid "setState during render" warnings.
  // This also allows skeletons to show during the initial client-side mount.
  useEffect(() => {
    if (!hasHydrated.current) {
      // Update organizations list if different
      if (organizations.length !== storedOrgs.length) {
        setOrganizations(organizations);
      }

      // Update current selection if different
      const needsUpdate = currentOrganization?.id !== storedOrg?.id || currentRole !== storedRole;
      if (needsUpdate) {
        setCurrentOrganization(currentOrganization, currentRole || undefined);
      }
      
      // Mark as hydrated
      setHydrated(true);
      hasHydrated.current = true;
    }
  }, [
    currentOrganization, 
    currentRole, 
    organizations, 
    setCurrentOrganization, 
    setOrganizations, 
    setHydrated, 
    storedOrg?.id, 
    storedRole, 
    storedOrgs.length
  ]);

  return <>{children}</>;
}
