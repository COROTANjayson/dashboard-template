export enum OrganizationRole {
  OWNER = "owner",
  ADMIN = "admin",
  TEAM_LEAD = "team_lead",
  MEMBER = "member",
}

export enum OrganizationMemberStatus {
  INVITED = "invited",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  LEFT = "left",
}

export interface Role {
  id: string;
  name: string;
  isDefault: boolean;
  permissions?: string[];
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  roleId: string;
  role: Role;
  status: OrganizationMemberStatus;
  invitedAt: string;
  joinedAt: string | null;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  inviterId: string;
  email: string;
  roleId: string;
  role: Role;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}
