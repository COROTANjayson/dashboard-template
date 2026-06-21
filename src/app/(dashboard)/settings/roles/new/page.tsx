"use client";

import { useOrganizationStore } from "@/app/store/organization.store";
import { RoleForm } from "@/components/roles/role-form";
import { ChevronLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function NewRolePage() {
  const { currentOrganization, hasPermission } = useOrganizationStore();

  if (!hasPermission("role:create")) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          You do not have permission to create roles.
        </p>
      </div>
    );
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
