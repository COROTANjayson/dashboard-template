"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { useOrganizationStore } from "@/app/store/organization.store";
import { User } from "@/types/auth";
import { Organization } from "@/types/organization";

interface StoreHydratorProps {
  user: User | null;
  currentOrganization: Organization | null;
  accessToken: string | null;
  children: React.ReactNode;
}

export function StoreHydrator({
  user,
  currentOrganization,
  accessToken,
  children,
}: StoreHydratorProps) {
  const hasHydrated = useRef(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setCurrentOrganization = useOrganizationStore((state) => state.setCurrentOrganization);

  useEffect(() => {
    if (!hasHydrated.current) {
      if (user || accessToken) {
        setAuth({ 
          user, 
          accessToken,
          isAuthenticated: !!accessToken 
        });
      }
      if (currentOrganization) {
        setCurrentOrganization(currentOrganization);
      }
      hasHydrated.current = true;
    }
  }, [user, currentOrganization, accessToken, setAuth, setCurrentOrganization]);

  return <>{children}</>;
}
