"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/app/store/organization.store";
import { useAuthStore } from "@/app/store/auth.store";
import { fetchTeam, fetchTeamMembers, removeTeamMember } from "@/services/team.service";
import { OrganizationRole } from "@/types/organization";
import { TeamMembersTable } from "../../../components/TeamMembersTable";
import { AddMemberDialog } from "../../../components/AddMemberDialog";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function TeamMembersPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const { currentOrganization, currentRole } = useOrganizationStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Basic permission check
  const canManage =
    currentRole === OrganizationRole.ADMIN ||
    currentRole === OrganizationRole.OWNER;

  const {
    data: team,
    isLoading: isTeamLoading,
    isError: isTeamError,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: ["team", currentOrganization?.id, teamId],
    queryFn: () => fetchTeam(currentOrganization!.id, teamId),
    enabled: !!currentOrganization?.id && !!teamId,
  });

  const {
    data: members,
    isLoading: isMembersLoading,
    isError: isMembersError,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: ["team-members", currentOrganization?.id, teamId],
    queryFn: () => fetchTeamMembers(currentOrganization!.id, teamId),
    enabled: !!currentOrganization?.id && !!teamId,
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) =>
      removeTeamMember(currentOrganization!.id, teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team-members", currentOrganization?.id, teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["teams", currentOrganization?.id],
      });
      toast.success("Member removed from team");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove member");
    },
  });

  if (isTeamLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isTeamError || !team) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load team</h2>
        <Button onClick={() => refetchTeam()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage members for the {team.name} team.
          </p>
        </div>
        
        {canManage && members && (
          <AddMemberDialog teamId={teamId} existingMembers={members} />
        )}
      </div>

      <TeamMembersTable
        members={members}
        leaderId={team.leaderId}
        canManage={canManage}
        isLoading={isMembersLoading}
        isError={isMembersError}
        onRetry={() => refetchMembers()}
        onRemoveMember={(userId) => removeMemberMutation.mutate(userId)}
        isRemoving={removeMemberMutation.isPending}
      />
    </div>
  );
}
