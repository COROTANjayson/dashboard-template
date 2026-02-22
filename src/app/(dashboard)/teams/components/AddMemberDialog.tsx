"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/app/store/organization.store";
import { fetchOrganizationMembers } from "@/services/organization.service";
import { addTeamMember } from "@/services/team.service";
import { TeamMember } from "@/types/team";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddMemberDialogProps {
  teamId: string;
  existingMembers: TeamMember[];
}

export function AddMemberDialog({ teamId, existingMembers }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { currentOrganization } = useOrganizationStore();
  const queryClient = useQueryClient();

  const { data: orgMembers, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["members", currentOrganization?.id],
    queryFn: () => fetchOrganizationMembers(currentOrganization!.id),
    enabled: !!currentOrganization?.id && open,
  });

  // Filter out users who are already team members
  const existingUserIds = useMemo(
    () => new Set(existingMembers.map((m) => m.userId)),
    [existingMembers],
  );

  const availableMembers = useMemo(() => {
    if (!orgMembers) return [];
    return orgMembers
      .filter((m) => m.status === "active" && !existingUserIds.has(m.userId))
      .filter((m) => {
        if (!search) return true;
        const name = `${m.user?.firstName || ""} ${m.user?.lastName || ""} ${m.user?.email || ""}`.toLowerCase();
        return name.includes(search.toLowerCase());
      });
  }, [orgMembers, existingUserIds, search]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => addTeamMember(currentOrganization!.id, teamId, selectedUserId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team-members", currentOrganization?.id, teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["teams", currentOrganization?.id],
      });
      toast.success("Member added to team");
      setOpen(false);
      setSelectedUserId(null);
      setSearch("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add member");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Select an organization member to add to this team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-search">Search Members</Label>
              <Input
                id="member-search"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-60 space-y-1 overflow-y-auto rounded-md border p-2">
              {isLoadingMembers ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Loading members...
                </p>
              ) : availableMembers.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No available members found.
                </p>
              ) : (
                availableMembers.map((member) => {
                  const name = [member.user?.firstName, member.user?.lastName]
                    .filter(Boolean)
                    .join(" ") || member.user?.email || "Unknown";
                  const isSelected = selectedUserId === member.userId;

                  return (
                    <button
                      key={member.userId}
                      type="button"
                      onClick={() => setSelectedUserId(member.userId)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted",
                      )}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium uppercase">
                        {(member.user?.firstName?.[0] || member.user?.email?.[0] || "?").toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{name}</p>
                        {member.user?.email && name !== member.user.email && (
                          <p className={cn(
                            "truncate text-xs",
                            isSelected ? "text-primary-foreground/70" : "text-muted-foreground",
                          )}>
                            {member.user.email}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !selectedUserId}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add Member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
