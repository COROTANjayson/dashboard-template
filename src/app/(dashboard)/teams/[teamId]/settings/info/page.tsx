"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationStore } from "@/app/store/organization.store";
import { useAuthStore } from "@/app/store/auth.store";
import { fetchTeam, updateTeam, deleteTeam } from "@/services/team.service";
import { OrganizationRole } from "@/types/organization";
import { DeleteTeamDialog } from "../../../components/DeleteTeamDialog";
import { Loader2, AlertCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function TeamInfoPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const router = useRouter();
  const { currentOrganization, currentRole } = useOrganizationStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [showDeleteTeam, setShowDeleteTeam] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const canManage =
    currentRole === OrganizationRole.ADMIN ||
    currentRole === OrganizationRole.OWNER;

  const {
    data: team,
    isLoading: isTeamLoading,
    isError: isTeamError,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: ["team", currentOrganization?.id, teamId],
    queryFn: () => fetchTeam(currentOrganization!.id, teamId),
    enabled: !!currentOrganization?.id && !!teamId,
  });

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        description: team.description || "",
      });
    }
  }, [team]);

  const updateTeamMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) => 
      updateTeam(currentOrganization!.id, teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["team", currentOrganization?.id, teamId],
      });
      queryClient.invalidateQueries({
        queryKey: ["teams", currentOrganization?.id],
      });
      toast.success("Team updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update team");
    }
  });

  const deleteTeamMutation = useMutation({
    mutationFn: () => deleteTeam(currentOrganization!.id, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teams", currentOrganization?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-teams", currentOrganization?.id],
      });
      toast.success("Team deleted successfully");
      router.push("/teams");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete team");
      setShowDeleteTeam(false);
    },
  });

  if (isTeamLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isTeamError || !team) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load team</h2>
        <Button onClick={() => refetchTeam()}>Try Again</Button>
      </div>
    );
  }

  const isLeader = team.leaderId === user?.id;
  const canDelete = canManage || isLeader;
  const canEdit = canManage || isLeader;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Team name is required");
      return;
    }
    updateTeamMutation.mutate(formData);
  };

  const isFormDirty = team.name !== formData.name || (team.description || "") !== formData.description;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage team profile and preferences.
        </p>
      </div>
      
      {/* Profile Settings */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6 border-b">
          <h3 className="font-semibold leading-none tracking-tight">Team Profile</h3>
          <p className="text-sm text-muted-foreground">
            Update your team's name and description.
          </p>
        </div>
        <div className="p-6">
          <form id="team-update-form" onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Engineering Team"
                disabled={!canEdit || updateTeamMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this team working on?"
                className="resize-none h-24"
                disabled={!canEdit || updateTeamMutation.isPending}
              />
            </div>
          </form>
        </div>
        {canEdit && (
          <div className="flex items-center p-6 pt-0">
            <Button 
              type="submit" 
              form="team-update-form"
              disabled={!isFormDirty || updateTeamMutation.isPending}
            >
              {updateTeamMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      {canDelete && (
        <div className="rounded-xl border border-destructive/20 bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6 border-b border-destructive/10">
            <h3 className="font-semibold leading-none tracking-tight text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Irreversible actions related to this team.
            </p>
          </div>
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-medium">Delete Team</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete this team and remove all its members. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteTeam(true)}
              className="shrink-0"
            >
              Delete Team
            </Button>
          </div>
        </div>
      )}

      <DeleteTeamDialog
        teamName={team.name}
        open={showDeleteTeam}
        onOpenChange={(open) => !open && setShowDeleteTeam(false)}
        onConfirm={() => deleteTeamMutation.mutate()}
        isPending={deleteTeamMutation.isPending}
      />
    </div>
  );
}
