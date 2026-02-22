"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/app/store/organization.store";
import {
  fetchTeam,
  fetchTeamMembers,
  removeTeamMember,
} from "@/services/team.service";
import { Team } from "@/types/team";
import { OrganizationRole } from "@/types/organization";
import { AddMemberDialog } from "./AddMemberDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Users,
  Crown,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface TeamsViewProps {
  team: Team;
}

export function TeamsView({ team }: TeamsViewProps) {
  const { currentOrganization, currentRole } = useOrganizationStore();
  const queryClient = useQueryClient();
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const canManage =
    currentRole === OrganizationRole.ADMIN ||
    currentRole === OrganizationRole.OWNER;

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
      setRemovingUserId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove member");
    },
  });

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
  const isLeader = currentTeam.leaderId === currentOrganization?.ownerId;

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {currentTeam.name}
          </h1>
          {currentTeam.description && (
            <p className="text-sm text-muted-foreground">
              {currentTeam.description}
            </p>
          )}
          <div className="flex items-center gap-3 pt-1">
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {currentTeam._count?.members ?? members?.length ?? 0} members
            </Badge>
            {currentTeam.leader && (
              <Badge variant="outline" className="gap-1">
                <Crown className="h-3 w-3" />
                {[currentTeam.leader.firstName, currentTeam.leader.lastName]
                  .filter(Boolean)
                  .join(" ") || currentTeam.leader.email}
              </Badge>
            )}
          </div>
        </div>
        {canManage && members && (
          <AddMemberDialog teamId={team.id} existingMembers={members} />
        )}
      </div>

      {/* Members Table */}
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm border-collapse">
            <thead>
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  Name
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  Email
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  Role
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  Joined
                </th>
                {canManage && (
                  <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isMembersLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-36" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <Skeleton className="ml-auto h-4 w-8" />
                      </td>
                    )}
                  </tr>
                ))
              ) : isMembersError ? (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Failed to load members.{" "}
                      <button
                        onClick={() => refetchMembers()}
                        className="text-primary underline hover:no-underline"
                      >
                        Retry
                      </button>
                    </p>
                  </td>
                </tr>
              ) : members && members.length > 0 ? (
                members.map((member) => {
                  const name = [member.user?.firstName, member.user?.lastName]
                    .filter(Boolean)
                    .join(" ") || "—";
                  const isMemberLeader = member.userId === currentTeam.leaderId;

                  return (
                    <tr
                      key={member.id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          {name}
                          {isMemberLeader && (
                            <Crown className="h-3 w-3 text-amber-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {member.user?.email || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={isMemberLeader ? "default" : "secondary"}>
                          {isMemberLeader ? "Leader" : "Member"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-right">
                          {!isMemberLeader && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setRemovingUserId(member.userId)}
                              aria-label="Remove member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No members in this team yet.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog
        open={!!removingUserId}
        onOpenChange={(open) => !open && setRemovingUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the team? They
              can be re-added later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingUserId && removeMemberMutation.mutate(removingUserId)}
              disabled={removeMemberMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMemberMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
