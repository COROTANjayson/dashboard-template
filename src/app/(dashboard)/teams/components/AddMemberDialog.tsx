"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/app/store/organization.store";
import { fetchOrganizationMembers } from "@/services/organization.service";
import { addTeamMembers } from "@/services/team.service";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, X, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddMemberDialogProps {
  teamId: string;
  existingMembers: TeamMember[];
}

export function AddMemberDialog({ teamId, existingMembers }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
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

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      addTeamMembers(currentOrganization!.id, teamId, Array.from(selectedUserIds)),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["team-members", currentOrganization?.id, teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["teams", currentOrganization?.id],
      });
      const count = result.added.length;
      toast.success(`${count} member${count !== 1 ? "s" : ""} added to team`);
      setOpen(false);
      setSelectedUserIds(new Set());
      setSearch("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add members");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.size === 0) return;
    mutate();
  };

  // Get display names for selected user chips
  const selectedMembers = useMemo(() => {
    if (!orgMembers) return [];
    return orgMembers.filter((m) => selectedUserIds.has(m.userId));
  }, [orgMembers, selectedUserIds]);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSelectedUserIds(new Set()); setSearch(""); } }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Members
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Team Members</DialogTitle>
          <DialogDescription>
            Select organization members to add to this team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Selected chips */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedMembers.map((m) => {
                  const name = [m.user?.firstName, m.user?.lastName].filter(Boolean).join(" ") || m.user?.email || "Unknown";
                  return (
                    <Badge key={m.userId} variant="secondary" className="gap-1 pr-1">
                      {name}
                      <button
                        type="button"
                        onClick={() => toggleUser(m.userId)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

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
                  const isSelected = selectedUserIds.has(member.userId);

                  return (
                    <button
                      key={member.userId}
                      type="button"
                      onClick={() => toggleUser(member.userId)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted",
                      )}
                    >
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium uppercase",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted",
                      )}>
                        {isSelected ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          (member.user?.firstName?.[0] || member.user?.email?.[0] || "?").toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{name}</p>
                        {member.user?.email && name !== member.user.email && (
                          <p className="truncate text-xs text-muted-foreground">
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
            <Button type="submit" disabled={isPending || selectedUserIds.size === 0}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Add ${selectedUserIds.size || ""} Member${selectedUserIds.size !== 1 ? "s" : ""}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
