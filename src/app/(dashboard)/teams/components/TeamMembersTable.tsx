"use client";

import { TeamMember } from "@/types/team";
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
import { Loader2, Crown, Trash2 } from "lucide-react";
import { useState } from "react";

interface TeamMembersTableProps {
  members?: TeamMember[];
  leaderId: string;
  canManage: boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onRemoveMember: (userId: string) => void;
  isRemoving: boolean;
}

export function TeamMembersTable({
  members,
  leaderId,
  canManage,
  isLoading,
  isError,
  onRetry,
  onRemoveMember,
  isRemoving,
}: TeamMembersTableProps) {
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const handleConfirmRemove = () => {
    if (removingUserId) {
      onRemoveMember(removingUserId);
      setRemovingUserId(null);
    }
  };

  return (
    <>
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
              {isLoading ? (
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
              ) : isError ? (
                <tr>
                  <td
                    colSpan={canManage ? 5 : 4}
                    className="px-4 py-8 text-center"
                  >
                    <p className="text-sm text-muted-foreground">
                      Failed to load members.{" "}
                      <button
                        onClick={onRetry}
                        className="text-primary underline hover:no-underline"
                      >
                        Retry
                      </button>
                    </p>
                  </td>
                </tr>
              ) : members && members.length > 0 ? (
                members.map((member) => {
                  const name =
                    [member.user?.firstName, member.user?.lastName]
                      .filter(Boolean)
                      .join(" ") || "—";
                  const isMemberLeader = member.userId === leaderId;

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
                        <Badge
                          variant={isMemberLeader ? "default" : "secondary"}
                        >
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
                  <td
                    colSpan={canManage ? 5 : 4}
                    className="px-4 py-8 text-center"
                  >
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
              onClick={handleConfirmRemove}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
