"use client";

import { OrganizationInvitation } from "@/types/organization";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Trash2 } from "lucide-react";
import { CountdownTimer } from "@/components/countdown-timer";

interface InvitationsTableProps {
  invitations: OrganizationInvitation[] | undefined;
  isLoading: boolean;
  revokeMutation: any;
  onRevoke: (id: string) => void;
}

export function InvitationsTable({
  invitations,
  isLoading,
  revokeMutation,
  onRevoke,
}: InvitationsTableProps) {
  if (isLoading) {
    return (
      <tbody className="[&_tr:last-child]:border-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={i} className="border-b">
            <td className="p-4 align-middle"><Skeleton className="h-4 w-[150px]" /></td>
            <td className="p-4 align-middle"><Skeleton className="h-4 w-[80px]" /></td>
            <td className="p-4 align-middle"><Skeleton className="h-4 w-[80px]" /></td>
            <td className="p-4 align-middle"><Skeleton className="h-4 w-[100px]" /></td>
            <td className="p-4 align-middle"><Skeleton className="h-4 w-[50px] ml-auto" /></td>
          </tr>
        ))}
      </tbody>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <tbody className="[&_tr:last-child]:border-0">
        <tr className="border-b transition-colors hover:bg-muted/50">
          <td colSpan={5} className="p-8 text-center text-muted-foreground">
            No invitations found.
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="[&_tr:last-child]:border-0">
      {invitations.map((invite) => (
        <tr key={invite.id} className="border-b transition-colors hover:bg-muted/50">
          <td className="p-4 align-middle font-medium">{invite.email}</td>
          <td className="p-4 align-middle">
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
              {invite.role}
            </span>
          </td>
          <td className="p-4 align-middle text-orange-600 dark:text-orange-400">
            <CountdownTimer expiresAt={invite.expiresAt} />
          </td>
          <td className="p-4 align-middle text-muted-foreground">
            {new Date(invite.createdAt).toLocaleDateString()}
          </td>
          <td className="p-4 align-middle text-right">
            <button
              onClick={() => onRevoke(invite.id)}
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
      ))}
    </tbody>
  );
}
