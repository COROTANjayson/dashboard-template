"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/app/store/organization.store";
import { useAuthStore } from "@/app/store/auth.store";
import { createTeam } from "@/services/team.service";
import { fetchOrganizationMembers } from "@/services/organization.service";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X, Check, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const { currentOrganization } = useOrganizationStore();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: orgMembers } = useQuery({
    queryKey: ["members", currentOrganization?.id],
    queryFn: () => fetchOrganizationMembers(currentOrganization!.id),
    enabled: !!currentOrganization?.id && open,
  });

  const filteredMembers = useMemo(() => {
    if (!orgMembers) return [];
    return orgMembers
      .filter((m) => m.status === "active" && m.userId !== currentUser?.id)
      .filter((m) => {
        if (!memberSearch) return true;
        const text = `${m.user?.firstName || ""} ${m.user?.lastName || ""} ${m.user?.email || ""}`.toLowerCase();
        return text.includes(memberSearch.toLowerCase());
      });
  }, [orgMembers, memberSearch]);

  const toggleMember = (userId: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const selectedMembers = useMemo(() => {
    if (!orgMembers) return [];
    return orgMembers.filter((m) => selectedMemberIds.has(m.userId));
  }, [orgMembers, selectedMemberIds]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      createTeam(currentOrganization!.id, {
        name,
        description: description || undefined,
        memberIds: selectedMemberIds.size > 0 ? Array.from(selectedMemberIds) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teams", currentOrganization?.id],
      });
      toast.success("Team created successfully");
      resetAndClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create team");
    },
  });

  const resetAndClose = () => {
    setOpen(false);
    setName("");
    setDescription("");
    setMemberSearch("");
    setSelectedMemberIds(new Set());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-9 w-9" aria-label="Create team">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
          <DialogDescription>
            Create a new team and optionally add members.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="e.g. Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={3}
                maxLength={50}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                placeholder="What does this team do?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={255}
                rows={3}
              />
            </div>

            {/* Add Members Section */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Add Members
                <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>

              {/* Selected chips */}
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedMembers.map((m) => {
                    const mName = [m.user?.firstName, m.user?.lastName].filter(Boolean).join(" ") || m.user?.email || "Unknown";
                    return (
                      <Badge key={m.userId} variant="secondary" className="gap-1 pr-1">
                        {mName}
                        <button
                          type="button"
                          onClick={() => toggleMember(m.userId)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              <Input
                placeholder="Search members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                {filteredMembers.length === 0 ? (
                  <p className="py-3 text-center text-sm text-muted-foreground">
                    No members found.
                  </p>
                ) : (
                  filteredMembers.map((member) => {
                    const mName = [member.user?.firstName, member.user?.lastName]
                      .filter(Boolean)
                      .join(" ") || member.user?.email || "Unknown";
                    const isSelected = selectedMemberIds.has(member.userId);

                    return (
                      <button
                        key={member.userId}
                        type="button"
                        onClick={() => toggleMember(member.userId)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted",
                        )}
                      >
                        <div className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium uppercase",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted",
                        )}>
                          {isSelected ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            (member.user?.firstName?.[0] || member.user?.email?.[0] || "?").toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{mName}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Team"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
