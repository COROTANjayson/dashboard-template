"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/app/store/organization.store";
import {
  fetchOrganizationMembers,
  fetchOrganizationInvitations,
  revokeInvitation,
  updateMemberRole,
  updateMemberStatus,
  removeMember,
} from "@/services/organization.service";
import {
  OrganizationMemberStatus,
  OrganizationRole,
} from "@/types/organization";
import { cn } from "@/lib/utils";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { toast } from "sonner";
import { MembersTable } from "./members-table";
import { InvitationsTable } from "./invitations-table";
import { MemberDialogs } from "./member-dialogs";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeaderContainer } from "@/components/shared/page-header-container";

type StatusTab = "active" | "invited" | "other";

export function MembersView() {
  const { currentOrganization, currentRole } = useOrganizationStore();
  const [activeTab, setActiveTab] = useState<StatusTab>("active");
  const [revokingInvitationId, setRevokingInvitationId] = useState<
    string | null
  >(null);
  const [suspendingMemberId, setSuspendingMemberId] = useState<string | null>(
    null,
  );
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const canManage =
    currentRole === OrganizationRole.ADMIN ||
    currentRole === OrganizationRole.OWNER;

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
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: OrganizationRole;
    }) => updateMemberRole(currentOrganization!.id, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members", currentOrganization?.id],
      });
      toast.success("Member role updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update role");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: OrganizationMemberStatus;
    }) => updateMemberStatus(currentOrganization!.id, userId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["members", currentOrganization?.id],
      });
      toast.success(
        `Member ${data.status === OrganizationMemberStatus.ACTIVE ? "reactivated" : "suspended"}`,
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) =>
      removeMember(currentOrganization!.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["members", currentOrganization?.id],
      });
      toast.success("Member removed from organization");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove member");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) =>
      revokeInvitation(currentOrganization!.id, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invitations", currentOrganization?.id],
      });
      toast.success("Invitation revoked successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to revoke invitation",
      );
    },
  });

  const isLoading =
    isMembersLoading || (activeTab === "invited" && isInvitationsLoading);

  const filteredMembers = members?.filter((member) => {
    if (activeTab === "active")
      return member.status === OrganizationMemberStatus.ACTIVE;
    if (activeTab === "other") {
      return (
        member.status === OrganizationMemberStatus.SUSPENDED ||
        member.status === OrganizationMemberStatus.LEFT
      );
    }
    return false;
  });

  const tabs: { id: StatusTab; label: string }[] = [
    { id: "active", label: "Active" },
    { id: "invited", label: "Invited" },
    { id: "other", label: "Suspended / Left" },
  ];

  return (
    <PageContainer>
      <PageHeaderContainer>
        <PageHeader
          title="Members"
          description="Manage your organization members and their roles."
        />
        <InviteMemberDialog />
      </PageHeaderContainer>

      <div className="flex items-center gap-1 border-b pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground",
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
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Email
                  </th>
                )}
                {activeTab !== "other" && (
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Role
                  </th>
                )}
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {activeTab === "invited" ? "Expires In" : "Status"}
                </th>
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                  {activeTab === "invited" ? "Sent At" : "Joined At"}
                </th>
                {(activeTab === "invited" || canManage) && (
                  <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            {activeTab === "invited" ? (
              <InvitationsTable
                invitations={invitations}
                isLoading={isLoading}
                revokeMutation={revokeMutation}
                onRevoke={setRevokingInvitationId}
              />
            ) : (
              <MembersTable
                members={filteredMembers}
                isLoading={isLoading}
                canManage={canManage}
                activeTab={activeTab}
                updateRoleMutation={updateRoleMutation}
                updateStatusMutation={updateStatusMutation}
                setSuspendingMemberId={setSuspendingMemberId}
                setRemovingMemberId={setRemovingMemberId}
              />
            )}
          </table>
        </div>
      </div>

      <MemberDialogs
        revokingId={revokingInvitationId}
        setRevokingId={setRevokingInvitationId}
        revokeMutation={revokeMutation}
        suspendingId={suspendingMemberId}
        setSuspendingId={setSuspendingMemberId}
        updateStatusMutation={updateStatusMutation}
        removingId={removingMemberId}
        setRemovingId={setRemovingMemberId}
        removeMemberMutation={removeMemberMutation}
      />
    </PageContainer>
  );
}
