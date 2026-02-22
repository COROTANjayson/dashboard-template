"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useOrganizationStore } from "@/app/store/organization.store";
import { useAuthStore } from "@/app/store/auth.store";
import {
  fetchTeam,
  fetchTeamMembers,
  removeTeamMember,
  deleteTeam,
} from "@/services/team.service";
import { Team } from "@/types/team";
import { OrganizationRole } from "@/types/organization";
import { TeamHeader } from "./TeamHeader";
import { TeamMembersTable } from "./TeamMembersTable";
import { DeleteTeamDialog } from "./DeleteTeamDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface TeamsViewProps {
  team: Team;
}

export function TeamsView({ team }: TeamsViewProps) {
  const { currentOrganization, currentRole } = useOrganizationStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showDeleteTeam, setShowDeleteTeam] = useState(false);

  const canManage =
    currentRole === OrganizationRole.ADMIN ||
    currentRole === OrganizationRole.OWNER;

  // --- Queries ---

  const {
    data: teamDetail,
    isLoading: isTeamLoading,
    isError: isTeamError,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: ["team", currentOrganization?.id, team.id],
    queryFn: () => fetchTeam(currentOrganization!.id, team.id),
    enabled: !!currentOrganization?.id && !!team.id,
  });

  const {
    data: members,
    isLoading: isMembersLoading,
    isError: isMembersError,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: ["team-members", currentOrganization?.id, team.id],
    queryFn: () => fetchTeamMembers(currentOrganization!.id, team.id),
    enabled: !!currentOrganization?.id && !!team.id,
  });

  // --- Mutations ---

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) =>
      removeTeamMember(currentOrganization!.id, team.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team-members", currentOrganization?.id, team.id],
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

  const deleteTeamMutation = useMutation({
    mutationFn: () => deleteTeam(currentOrganization!.id, team.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teams", currentOrganization?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-teams", currentOrganization?.id],
      });
      toast.success("Team deleted successfully");
      router.push("/teams");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete team");
      setShowDeleteTeam(false);
    },
  });

  // --- Loading / Error states ---

  if (isTeamLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isTeamError) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load team</h2>
        <Button onClick={() => refetchTeam()}>Try Again</Button>
      </div>
    );
  }

  const currentTeam = teamDetail || team;
  const isLeader = currentTeam.leaderId === user?.id;
  const canDelete = canManage || isLeader;

  // --- Render ---

  return (
    <div className="space-y-6">
      <TeamHeader
        team={currentTeam}
        members={members}
        canManage={canManage}
        canDelete={canDelete}
        onDeleteClick={() => setShowDeleteTeam(true)}
      />

      <TeamMembersTable
        members={members}
        leaderId={currentTeam.leaderId}
        canManage={canManage}
        isLoading={isMembersLoading}
        isError={isMembersError}
        onRetry={() => refetchMembers()}
        onRemoveMember={(userId) => removeMemberMutation.mutate(userId)}
        isRemoving={removeMemberMutation.isPending}
      />

      <DeleteTeamDialog
        teamName={currentTeam.name}
        open={showDeleteTeam}
        onOpenChange={(open) => !open && setShowDeleteTeam(false)}
        onConfirm={() => deleteTeamMutation.mutate()}
        isPending={deleteTeamMutation.isPending}
      />
    </div>
  );
}
