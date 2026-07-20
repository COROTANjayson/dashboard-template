"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Shield } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useOrganizationStore } from "@/app/store/organization.store";
import { fetchRoles, deleteRole } from "@/services/role.service";
import { Role } from "@/types/organization";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { AccessDenied } from "@/components/access-denied";

export default function RolesPage() {
  const router = useRouter();
  const { currentOrganization, hasPermission } = useOrganizationStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const canManageRoles = hasPermission("role:create") || hasPermission("role:update");

  const loadRoles = useCallback(async () => {
    if (!currentOrganization) return;
    try {
      setIsLoading(true);
      const data = await fetchRoles(currentOrganization.id);
      setRoles(data);
    } catch {
      toast.error("Failed to load roles");
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const handleDelete = async (roleId: string) => {
    try {
      await deleteRole(currentOrganization!.id, roleId);
      toast.success("Role deleted successfully");
      loadRoles();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete role");
    }
  };

  const handleCreateNew = () => {
    router.push("/settings/roles/new");
  };

  const handleEdit = (role: Role) => {
    router.push(`/settings/roles/${role.id}`);
  };

  if (!hasPermission("role:read")) {
    return <AccessDenied description="You do not have permission to view roles." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Roles & Permissions</h2>
          <p className="text-sm text-muted-foreground">
            Manage custom roles and their permissions in your organization.
          </p>
        </div>
        {canManageRoles && (
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Permissions Count</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b transition-colors">
                    <td className="p-4 align-middle">
                      <Skeleton className="h-5 w-[150px]" />
                    </td>
                    <td className="p-4 align-middle">
                      <Skeleton className="h-5 w-[100px]" />
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="h-24 text-center align-middle text-muted-foreground">
                    No roles found.
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium capitalize">{role.name}</span>
                        {role.isDefault && (
                          <Badge variant="secondary" className="ml-2">Default</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {role.permissions.length} permissions
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex justify-end gap-2">
                        {canManageRoles && role.name !== "owner" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(role)}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        )}
                        {canManageRoles && !role.isDefault && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the &quot;{role.name}&quot; role? Any members with this role will lose their permissions.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(role.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
