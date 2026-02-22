export interface TeamLeader {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatar: string | null;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  leaderId: string;
  createdAt: string;
  updatedAt: string;
  leader: TeamLeader;
  _count: {
    members: number;
  };
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  joinedAt: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    avatar: string | null;
  };
}

export interface CreateTeamInput {
  name: string;
  description?: string;
  memberIds?: string[];
}

export interface UpdateTeamInput {
  name?: string;
  description?: string;
}

export interface AddTeamMembersResult {
  added: TeamMember[];
  skipped: string[];
}
