"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/app/store/organization.store";
import { fetchOrganizationMembers, fetchOrganizationInvitations, revokeInvitation, updateMemberRole, updateMemberStatus, removeMember } from "@/services/organization.service";
import { Skeleton } from "@/components/ui/skeleton";
import { OrganizationMemberStatus, OrganizationRole } from "@/types/organization";
import { cn } from "@/lib/utils";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { CountdownTimer } from "@/components/countdown-timer";
import { Trash2, Loader2, AlertTriangle, ShieldCheck, UserMinus, UserCheck, MoreVertical } from "lucide-react";
import { toast } from "sonner";
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

type StatusTab = "active" | "invited" | "other";

export default function MembersPage() {
  const { currentOrganization } = useOrganizationStore();
  const [activeTab, setActiveTab] = useState<StatusTab>("active");
  const [revokingInvitationId, setRevokingInvitationId] = useState<string | null>(null);
  const [suspendingMemberId, setSuspendingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Role constants for the selector
  const roles = [
    { value: OrganizationRole.ADMIN, label: "Admin" },
    { value: OrganizationRole.MEMBER, label: "Member" },
  ];

  const canManage = currentOrganization?.role === OrganizationRole.ADMIN || currentOrganization?.role === OrganizationRole.OWNER;

  const { data: members, isLoading: isMembersLoading } = useQuery({
    queryKey: ["members", currentOrganization?.id],
    queryFn: () => fetchOrganizationMembers(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
  });

  const { data: invitations, isLoading: isInvitationsLoading } = useQuery({
    queryKey: ["invitations", currentOrganization?.id],
    queryFn: () => fetchOrganizationInvitations(currentOrganization!.id),
    enabled: !!currentOrganization?.id && activeTab === "invited",
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: OrganizationRole }) =>
      updateMemberRole(currentOrganization!.id, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", currentOrganization?.id] });
      toast.success("Member role updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update role");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: OrganizationMemberStatus }) =>
      updateMemberStatus(currentOrganization!.id, userId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["members", currentOrganization?.id] });
      toast.success(`Member ${data.status === OrganizationMemberStatus.ACTIVE ? "reactivated" : "suspended"}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => removeMember(currentOrganization!.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", currentOrganization?.id] });
      toast.success("Member removed from organization");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove member");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) => revokeInvitation(currentOrganization!.id, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations", currentOrganization?.id] });
      toast.success("Invitation revoked successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to revoke invitation");
    },
  });

  const isLoading = isMembersLoading || (activeTab === "invited" && isInvitationsLoading);

  const filteredMembers = members?.filter((member) => {
    if (activeTab === "active") return member.status === OrganizationMemberStatus.ACTIVE;
    if (activeTab === "other") {
      return (
        member.status === OrganizationMemberStatus.SUSPENDED ||
        member.status === OrganizationMemberStatus.LEFT
      );
    }
    return false;
  });

  const handleRevoke = (invitationId: string) => {
    setRevokingInvitationId(invitationId);
  };

  const tabs: { id: StatusTab; label: string }[] = [
    { id: "active", label: "Active" },
    { id: "invited", label: "Invited" },
    { id: "other", label: "Suspended / Left" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium">Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage your organization members and their roles.
          </p>
        </div>
        <InviteMemberDialog />
      </div>

      <div className="flex items-center gap-1 border-b pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm border-collapse">
            <thead>
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {activeTab === "invited" ? "Email" : "Name"}
                </th>
                {activeTab !== "invited" && (
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                )}
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {activeTab === "invited" ? "Expires In" : "Status"}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                   {activeTab === "invited" ? "Sent At" : "Joined At"}
                </th>
                {(activeTab === "invited" || canManage) && (
                  <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4 align-middle"><Skeleton className="h-4 w-[150px]" /></td>
                    {activeTab !== "invited" && <td className="p-4 align-middle"><Skeleton className="h-4 w-[200px]" /></td>}
                    <td className="p-4 align-middle"><Skeleton className="h-4 w-[80px]" /></td>
                    <td className="p-4 align-middle"><Skeleton className="h-4 w-[80px]" /></td>
                    <td className="p-4 align-middle"><Skeleton className="h-4 w-[100px]" /></td>
                    {activeTab === "invited" && <td className="p-4 align-middle"><Skeleton className="h-4 w-[50px] ml-auto" /></td>}
                  </tr>
                ))
              ) : activeTab === "invited" ? (
                invitations?.map((invite) => (
                  <tr key={invite.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{invite.email}</td>
                    <td className="p-4 align-middle">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                        {invite.role}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-orange-600">
                      <CountdownTimer expiresAt={invite.expiresAt} />
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <button
                        onClick={() => handleRevoke(invite.id)}
                        disabled={revokeMutation.isPending && revokeMutation.variables === invite.id}
                        className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        title="Revoke Invitation"
                      >
                        {revokeMutation.isPending && revokeMutation.variables === invite.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : filteredMembers?.map((member) => (
                <tr key={member.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle font-medium">
                    {member.user ? `${member.user.firstName || ""} ${member.user.lastName || ""}` : "-"}
                  </td>
                  <td className="p-4 align-middle">{member.user?.email}</td>
                  <td className="p-4 align-middle">
                    {canManage && member.role !== OrganizationRole.OWNER ? (
                      <select
                        value={member.role}
                        onChange={(e) => updateRoleMutation.mutate({ userId: member.userId, role: e.target.value as OrganizationRole })}
                        disabled={updateRoleMutation.isPending && updateRoleMutation.variables?.userId === member.userId}
                        className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer hover:underline disabled:opacity-50"
                      >
                        {roles.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                        {member.role}
                      </span>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                      member.status === OrganizationMemberStatus.ACTIVE && "bg-green-100 text-green-700 border-green-200",
                      member.status === OrganizationMemberStatus.SUSPENDED && "bg-yellow-100 text-yellow-700 border-yellow-200",
                      member.status === OrganizationMemberStatus.LEFT && "bg-red-100 text-red-700 border-red-200"
                    )}>
                      {member.status}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-muted-foreground">
                    {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : "-"}
                  </td>
                  {canManage && (
                    <td className="p-4 align-middle text-right">
                      {member.role !== OrganizationRole.OWNER && (
                        <div className="flex justify-end gap-2">
                          {member.status === OrganizationMemberStatus.ACTIVE ? (
                            <button
                              onClick={() => setSuspendingMemberId(member.userId)}
                              disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.userId === member.userId}
                              className="text-muted-foreground hover:text-yellow-600 transition-colors disabled:opacity-50"
                              title="Suspend Member"
                            >
                              <UserMinus className="h-4 w-4" />
                            </button>
                          ) : member.status === OrganizationMemberStatus.SUSPENDED ? (
                            <button
                              onClick={() => updateStatusMutation.mutate({ userId: member.userId, status: OrganizationMemberStatus.ACTIVE })}
                              disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.userId === member.userId}
                              className="text-muted-foreground hover:text-green-600 transition-colors disabled:opacity-50"
                              title="Reactivate Member"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          ) : null}
                          <button
                            onClick={() => setRemovingMemberId(member.userId)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {!isLoading && (
                (activeTab === "invited" && (!invitations || invitations.length === 0)) ||
                (activeTab !== "invited" && (!filteredMembers || filteredMembers.length === 0))
              ) && (
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <td colSpan={activeTab === "invited" ? 5 : 5} className="p-8 text-center text-muted-foreground">
                    No {activeTab} {activeTab === "invited" ? "invitations" : "members"} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog 
        open={!!revokingInvitationId} 
        onOpenChange={(open) => !open && setRevokingInvitationId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Revoke Invitation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this invitation? This action cannot be undone, and the link will no longer work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (revokingInvitationId) {
                  revokeMutation.mutate(revokingInvitationId, {
                    onSuccess: () => setRevokingInvitationId(null),
                  });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke Invitation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog 
        open={!!suspendingMemberId} 
        onOpenChange={(open) => !open && setSuspendingMemberId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-yellow-600" />
              Suspend Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend this member? They will no longer be able to access organization resources until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatusMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (suspendingMemberId) {
                  updateStatusMutation.mutate(
                    { userId: suspendingMemberId, status: OrganizationMemberStatus.SUSPENDED },
                    { onSuccess: () => setSuspendingMemberId(null) }
                  );
                }
              }}
              className="bg-yellow-600 text-white hover:bg-yellow-700"
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suspending...
                </>
              ) : (
                "Suspend Member"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog 
        open={!!removingMemberId} 
        onOpenChange={(open) => !open && setRemovingMemberId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Remove Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member? This action is permanent and they will lose all access to organization resources immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMemberMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (removingMemberId) {
                  removeMemberMutation.mutate(removingMemberId, {
                    onSuccess: () => setRemovingMemberId(null),
                  });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeMemberMutation.isPending}
            >
              {removeMemberMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Member"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
