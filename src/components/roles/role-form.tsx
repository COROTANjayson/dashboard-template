"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createRole, updateRole } from "@/services/role.service";
import { OrganizationPermission, Role } from "@/types/organization";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AVAILABLE_PERMISSIONS = [
  { id: OrganizationPermission.ORG_READ, group: "Organization", label: "Read Organization", description: "Can view organization details." },
  { id: OrganizationPermission.ORG_UPDATE, group: "Organization", label: "Update Organization", description: "Can edit organization settings." },
  { id: OrganizationPermission.ORG_DELETE, group: "Organization", label: "Delete Organization", description: "Can permanently delete the organization." },
  { id: OrganizationPermission.MEMBER_LIST, group: "Members", label: "List Members", description: "Can view the list of organization members." },
  { id: OrganizationPermission.MEMBER_INVITE, group: "Members", label: "Invite Members", description: "Can invite new members." },
  { id: OrganizationPermission.MEMBER_INVITE_REVOKE, group: "Members", label: "Revoke Invites", description: "Can cancel pending invitations." },
  { id: OrganizationPermission.MEMBER_UPDATE_ROLE, group: "Members", label: "Update Member Roles", description: "Can change roles of existing members." },
  { id: OrganizationPermission.MEMBER_UPDATE_STATUS, group: "Members", label: "Update Member Status", description: "Can suspend or activate members." },
  { id: OrganizationPermission.MEMBER_REMOVE, group: "Members", label: "Remove Members", description: "Can remove members from the organization." },
  { id: OrganizationPermission.TEAM_READ, group: "Teams", label: "Read Teams", description: "Can view teams and their members." },
  { id: OrganizationPermission.TEAM_CREATE, group: "Teams", label: "Create Teams", description: "Can create new teams." },
  { id: OrganizationPermission.TEAM_UPDATE, group: "Teams", label: "Update Teams", description: "Can edit existing teams." },
  { id: OrganizationPermission.TEAM_DELETE, group: "Teams", label: "Delete Teams", description: "Can delete teams." },
  { id: OrganizationPermission.ROLE_READ, group: "Roles", label: "Read Roles", description: "Can view available roles." },
  { id: OrganizationPermission.ROLE_CREATE, group: "Roles", label: "Create Roles", description: "Can create custom roles." },
  { id: OrganizationPermission.ROLE_UPDATE, group: "Roles", label: "Update Roles", description: "Can edit custom roles." },
  { id: OrganizationPermission.ROLE_DELETE, group: "Roles", label: "Delete Roles", description: "Can delete custom roles." },
];

const PERMISSION_GROUPS = Array.from(new Set(AVAILABLE_PERMISSIONS.map((p) => p.group)));

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  permissions: z.array(z.enum(OrganizationPermission)),
});

interface RoleFormProps {
  roleToEdit?: Role;
  organizationId: string;
}

export function RoleForm({ roleToEdit, organizationId }: RoleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: roleToEdit?.name || "",
      permissions: roleToEdit?.permissions || [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      if (roleToEdit) {
        await updateRole(organizationId, roleToEdit.id, values);
        toast.success("Role updated successfully");
      } else {
        await createRole(organizationId, values.name, values.permissions);
        toast.success("Role created successfully");
      }
      router.push("/settings/roles");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDefault = roleToEdit?.isDefault;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl pb-16">
        <Card>
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
            <CardDescription>
              Provide a name for this role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Content Manager" {...field} disabled={isDefault} />
                  </FormControl>
                  {isDefault && (
                    <FormDescription>
                      Default role names cannot be changed.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Permissions</h3>
            <p className="text-sm text-muted-foreground">
              Select the permissions you want to grant to this role, organized by feature.
            </p>
          </div>

          <div className="grid gap-6">
            {PERMISSION_GROUPS.map((group) => {
              const groupPermissions = AVAILABLE_PERMISSIONS.filter((p) => p.group === group);
              
              return (
                <Card key={group}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{group}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    {groupPermissions.map((permission) => (
                      <FormField
                        key={permission.id}
                        control={form.control}
                        name="permissions"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border px-4 py-2 shadow-sm">
                            <div className="space-y-0.5 pr-4">
                              <FormLabel className="text-sm font-medium">
                                {permission.label}
                              </FormLabel>
                              <FormDescription className="text-xs">
                                {permission.description}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value?.includes(permission.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, permission.id])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== permission.id)
                                      )
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/settings/roles")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Role"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
