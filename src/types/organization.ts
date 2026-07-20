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

export const OrganizationPermission = {
  ORG_READ: "org:read",
  ORG_UPDATE: "org:update",
  ORG_DELETE: "org:delete",
  MEMBER_LIST: "member:list",
  MEMBER_INVITE: "member:invite",
  MEMBER_INVITE_REVOKE: "member:invite-revoke",
  MEMBER_UPDATE_ROLE: "member:update-role",
  MEMBER_UPDATE_STATUS: "member:update-status",
  MEMBER_REMOVE: "member:remove",
  TEAM_CREATE: "team:create",
  TEAM_UPDATE: "team:update",
  TEAM_DELETE: "team:delete",
  TEAM_READ: "team:read",
  ROLE_CREATE: "role:create",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",
  ROLE_READ: "role:read",
} as const;

export type OrganizationPermission =
  (typeof OrganizationPermission)[keyof typeof OrganizationPermission];

export interface Role {
  id: string;
  name: string;
  isDefault: boolean;
  permissions: OrganizationPermission[];
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
  roleId?: string | null;
  role?: Role | null;
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
  roleId?: string | null;
  role?: Role | null;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}
