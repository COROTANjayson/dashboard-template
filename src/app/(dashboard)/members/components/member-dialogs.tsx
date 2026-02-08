"use client";

import { OrganizationMemberStatus } from "@/types/organization";
import { 
  AlertTriangle, 
  Loader2, 
  Trash2, 
  UserMinus 
} from "lucide-react";
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

interface MemberDialogsProps {
  revokingId: string | null;
  setRevokingId: (id: string | null) => void;
  revokeMutation: any;
  
  suspendingId: string | null;
  setSuspendingId: (id: string | null) => void;
  updateStatusMutation: any;
  
  removingId: string | null;
  setRemovingId: (id: string | null) => void;
  removeMemberMutation: any;
}

export function MemberDialogs({
  revokingId,
  setRevokingId,
  revokeMutation,
  suspendingId,
  setSuspendingId,
  updateStatusMutation,
  removingId,
  setRemovingId,
  removeMemberMutation,
}: MemberDialogsProps) {
  return (
    <>
      <AlertDialog 
        open={!!revokingId} 
        onOpenChange={(open) => !open && setRevokingId(null)}
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
                if (revokingId) {
                  revokeMutation.mutate(revokingId, {
                    onSuccess: () => setRevokingId(null),
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
        open={!!suspendingId} 
        onOpenChange={(open) => !open && setSuspendingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserMinus className="h-5 w-5 text-amber-600 dark:text-amber-400" />
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
                if (suspendingId) {
                  updateStatusMutation.mutate(
                    { userId: suspendingId, status: OrganizationMemberStatus.SUSPENDED },
                    { onSuccess: () => setSuspendingId(null) }
                  );
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
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
        open={!!removingId} 
        onOpenChange={(open) => !open && setRemovingId(null)}
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
                if (removingId) {
                  removeMemberMutation.mutate(removingId, {
                    onSuccess: () => setRemovingId(null),
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
    </>
  );
}
