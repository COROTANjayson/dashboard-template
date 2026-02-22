import api from "@/lib/api";
import { Team, TeamMember, CreateTeamInput, UpdateTeamInput } from "@/types/team";

export const fetchTeams = async (orgId: string): Promise<Team[]> => {
  const { data } = await api.get(`/organizations/${orgId}/teams`);
  return data.data;
};

export const fetchMyTeams = async (orgId: string): Promise<Team[]> => {
  const { data } = await api.get(`/organizations/${orgId}/teams/mine`);
  return data.data;
};

export const createTeam = async (orgId: string, input: CreateTeamInput): Promise<Team> => {
  const { data } = await api.post(`/organizations/${orgId}/teams`, input);
  return data.data;
};

export const fetchTeam = async (orgId: string, teamId: string): Promise<Team> => {
  const { data } = await api.get(`/organizations/${orgId}/teams/${teamId}`);
  return data.data;
};

export const updateTeam = async (orgId: string, teamId: string, input: UpdateTeamInput): Promise<Team> => {
  const { data } = await api.patch(`/organizations/${orgId}/teams/${teamId}`, input);
  return data.data;
};

export const fetchTeamMembers = async (orgId: string, teamId: string): Promise<TeamMember[]> => {
  const { data } = await api.get(`/organizations/${orgId}/teams/${teamId}/members`);
  return data.data;
};

export const addTeamMember = async (orgId: string, teamId: string, userId: string): Promise<TeamMember> => {
  const { data } = await api.post(`/organizations/${orgId}/teams/${teamId}/members`, { userId });
  return data.data;
};

export const removeTeamMember = async (orgId: string, teamId: string, userId: string): Promise<void> => {
  await api.delete(`/organizations/${orgId}/teams/${teamId}/members/${userId}`);
};
