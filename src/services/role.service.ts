import api from "@/lib/api";
import { OrganizationPermission, Role } from "@/types/organization";

export async function fetchRoles(organizationId: string): Promise<Role[]> {
  const { data } = await api.get(`/organizations/${organizationId}/roles`);
  return data.data;
}

export async function createRole(organizationId: string, name: string, permissions: OrganizationPermission[]): Promise<Role> {
  const { data } = await api.post(`/organizations/${organizationId}/roles`, {
    name,
    permissions,
  });
  return data.data;
}

export async function updateRole(organizationId: string, roleId: string, payload: { name?: string; permissions?: OrganizationPermission[] }): Promise<Role> {
  const { data } = await api.put(
    `/organizations/${organizationId}/roles/${roleId}`,
    payload,
  );
  return data.data;
}

export async function deleteRole(organizationId: string, roleId: string): Promise<void> {
  await api.delete(`/organizations/${organizationId}/roles/${roleId}`);
}
