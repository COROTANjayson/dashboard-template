import api from "@/lib/api";
import { Organization, OrganizationInvitation, OrganizationMember, OrganizationMemberStatus, Role } from "@/types/organization";

export const fetchUserOrganizations = async (): Promise<Organization[]> => {
  const { data } = await api.get("/organizations");
  return data.data; // Assuming response format { data: { data: Organization[] } } or similar based on backend utils
};

export const createOrganization = async (name: string): Promise<Organization> => {
  const { data } = await api.post("/organizations", { name });
  return data.data;
};

export const fetchOrganizationMembers = async (orgId: string): Promise<OrganizationMember[]> => {
  const { data } = await api.get(`/organizations/${orgId}/members`);
  return data.data;
};

export const fetchOrganizationRoles = async (orgId: string): Promise<Role[]> => {
  const { data } = await api.get(`/organizations/${orgId}/roles`);
  return data.data;
};

export const fetchCurrentMember = async (orgId: string): Promise<OrganizationMember> => {
  const { data } = await api.get(`/organizations/${orgId}/members/me`);
  return data.data;
};

export const fetchOrganizationInvitations = async (orgId: string): Promise<OrganizationInvitation[]> => {
  const { data } = await api.get(`/organizations/${orgId}/invitations`);
  return data.data;
};

export const inviteMember = async (orgId: string, email: string, roleId: string): Promise<OrganizationInvitation> => {
  const { data } = await api.post(`/organizations/${orgId}/invitations`, { email, roleId });
  return data.data;
};

export const revokeInvitation = async (orgId: string, invitationId: string): Promise<void> => {
  await api.delete(`/organizations/${orgId}/invitations/${invitationId}`);
};

export const updateMemberRole = async (orgId: string, userId: string, roleId: string): Promise<OrganizationMember> => {
  const { data } = await api.patch(`/organizations/${orgId}/members/${userId}/role`, { roleId });
  return data.data;
};

export const updateMemberStatus = async (orgId: string, userId: string, status: OrganizationMemberStatus): Promise<OrganizationMember> => {
  const { data } = await api.patch(`/organizations/${orgId}/members/${userId}/status`, { status });
  return data.data;
};

export const removeMember = async (orgId: string, userId: string): Promise<void> => {
  await api.delete(`/organizations/${orgId}/members/${userId}`);
};

export const acceptInvite = async (token: string): Promise<void> => {
  await api.post("/organizations/invites/accept", { token });
};

export const getInvitationDetails = async (token: string): Promise<{
    invitation: OrganizationInvitation;
    organization: { name: string };
    inviter: { name: string; email: string };
    isExistingMember: boolean;
}> => {
  const { data } = await api.get(`/organizations/invites/${token}`);
  return data.data;
};
