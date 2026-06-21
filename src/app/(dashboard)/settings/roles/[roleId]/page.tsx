"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useOrganizationStore } from "@/app/store/organization.store";
import { RoleForm } from "@/components/roles/role-form";
import { ChevronLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { fetchRoles } from "@/services/role.service";
import { Role } from "@/types/organization";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function EditRolePage() {
  const params = useParams();
  const roleId = params.roleId as string;
  const { currentOrganization, hasPermission } = useOrganizationStore();
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentOrganization && roleId) {
      const loadRole = async () => {
        try {
          setIsLoading(true);
          const roles = await fetchRoles(currentOrganization.id);
          const role = roles.find((r) => r.id === roleId);
          if (role) {
            setRoleToEdit(role);
          } else {
            toast.error("Role not found");
          }
        } catch (error) {
          toast.error("Failed to load role details");
        } finally {
          setIsLoading(false);
        }
      };
      loadRole();
    }
  }, [currentOrganization, roleId]);

  if (!hasPermission("role:update")) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          You do not have permission to edit roles.
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
        <h2 className="text-xl font-semibold">Edit Role</h2>
        <p className="text-sm text-muted-foreground">
          Modify the permissions for this role.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4 max-w-4xl">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : roleToEdit && currentOrganization ? (
        <RoleForm roleToEdit={roleToEdit} organizationId={currentOrganization.id} />
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          Role could not be loaded.
        </div>
      )}
    </div>
  );
}
