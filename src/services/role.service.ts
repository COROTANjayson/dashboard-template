import Cookies from "js-cookie";
import { Role } from "@/types/organization";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeader() {
  const token = Cookies.get("accessToken");
  return { Authorization: `Bearer ${token}` };
}

export async function fetchRoles(organizationId: string): Promise<Role[]> {
  const response = await fetch(`${API_URL}/organizations/${organizationId}/roles`, {
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch roles");
  }

  const data = await response.json();
  return data.data;
}

export async function createRole(organizationId: string, name: string, permissions: string[]): Promise<Role> {
  const response = await fetch(`${API_URL}/organizations/${organizationId}/roles`, {
    method: "POST",
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, permissions }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create role");
  }

  const data = await response.json();
  return data.data;
}

export async function updateRole(organizationId: string, roleId: string, payload: { name?: string; permissions?: string[] }): Promise<Role> {
  const response = await fetch(`${API_URL}/organizations/${organizationId}/roles/${roleId}`, {
    method: "PUT",
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update role");
  }

  const data = await response.json();
  return data.data;
}

export async function deleteRole(organizationId: string, roleId: string): Promise<void> {
  const response = await fetch(`${API_URL}/organizations/${organizationId}/roles/${roleId}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete role");
  }
}
