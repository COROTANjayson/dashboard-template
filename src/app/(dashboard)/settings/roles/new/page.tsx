"use client";

import { useOrganizationStore } from "@/app/store/organization.store";
import { RoleForm } from "@/components/roles/role-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { AccessDenied } from "@/components/access-denied";

export default function NewRolePage() {
  const { currentOrganization, hasPermission } = useOrganizationStore();

  if (!hasPermission("role:create")) {
    return <AccessDenied description="You do not have permission to create roles." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/settings/roles" 
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Roles
        </Link>
      </div>
      <div>
        <h2 className="text-xl font-semibold">Create Role</h2>
        <p className="text-sm text-muted-foreground">
          Create a new custom role with specific permissions.
        </p>
      </div>

      {currentOrganization && (
        <RoleForm organizationId={currentOrganization.id} />
      )}
    </div>
  );
}
