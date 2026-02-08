"use client";

import { OrganizationMember, OrganizationMemberStatus, OrganizationRole } from "@/types/organization";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Loader2, UserMinus, UserCheck, Trash2 } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface MembersTableProps {
  members: OrganizationMember[] | undefined;
  isLoading: boolean;
  canManage: boolean;
  activeTab?: string;
  updateRoleMutation: any;
  updateStatusMutation: any;
  setSuspendingMemberId: (id: string | null) => void;
  setRemovingMemberId: (id: string | null) => void;
}

export function MembersTable({
  members,
  isLoading,
  canManage,
  activeTab,
  updateRoleMutation,
  updateStatusMutation,
  setSuspendingMemberId,
  setRemovingMemberId,
}: MembersTableProps) {
  const roles = [
    { value: OrganizationRole.ADMIN, label: "Admin" },
    { value: OrganizationRole.MEMBER, label: "Member" },
  ];

  if (isLoading) {
    return (
      <tbody className="[&_tr:last-child]:border-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={i} className="border-b">
            <td className="p-4 align-middle"><Skeleton className="h-4 w-[150px]" /></td>
            <td className="p-4 align-middle"><Skeleton className="h-4 w-[200px]" /></td>
            {activeTab !== "other" && <td className="p-4 align-middle"><Skeleton className="h-4 w-[80px]" /></td>}
            <td className="p-4 align-middle"><Skeleton className="h-4 w-[80px]" /></td>
            <td className="p-4 align-middle"><Skeleton className="h-4 w-[100px]" /></td>
          </tr>
        ))}
      </tbody>
    );
  }

  if (!members || members.length === 0) {
    return (
      <tbody className="[&_tr:last-child]:border-0">
        <tr className="border-b transition-colors hover:bg-muted/50">
          <td colSpan={activeTab === "active" ? 6 : 5} className="p-8 text-center text-muted-foreground">
            No members found.
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="[&_tr:last-child]:border-0">
      {members.map((member) => (
        <tr key={member.id} className="border-b transition-colors hover:bg-muted/50">
          <td className="p-4 align-middle font-medium">
            {member.user ? `${member.user.firstName || ""} ${member.user.lastName || ""}` : "-"}
          </td>
          <td className="p-4 align-middle">{member.user?.email}</td>
          {activeTab !== "other" && (
            <td className="p-4 align-middle">
              {canManage && member.role !== OrganizationRole.OWNER ? (
                <Select
                  value={member.role}
                  onValueChange={(value) => 
                    updateRoleMutation.mutate({ 
                      userId: member.userId, 
                      role: value as OrganizationRole 
                    })
                  }
                  disabled={updateRoleMutation.isPending && updateRoleMutation.variables?.userId === member.userId}
                >
                  <SelectTrigger size="sm" className="h-7 w-[100px] border-none bg-transparent hover:bg-muted/50 transition-colors py-0 px-2 font-semibold">
                    {updateRoleMutation.isPending && updateRoleMutation.variables?.userId === member.userId ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    ) : null}
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                  {member.role}
                </span>
              )}
            </td>
          )}
          <td className="p-4 align-middle">
            <span className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
              member.status === OrganizationMemberStatus.ACTIVE && "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-800",
              member.status === OrganizationMemberStatus.SUSPENDED && "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-800",
              member.status === OrganizationMemberStatus.LEFT && "bg-destructive/10 text-destructive border-destructive/20"
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
                      className="text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors disabled:opacity-50"
                      title="Suspend Member"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  ) : member.status === OrganizationMemberStatus.SUSPENDED ? (
                    <button
                      onClick={() => updateStatusMutation.mutate({ userId: member.userId, status: OrganizationMemberStatus.ACTIVE })}
                      disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.userId === member.userId}
                      className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:opacity-50"
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
    </tbody>
  );
}
