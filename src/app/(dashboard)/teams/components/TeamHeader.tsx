"use client";

import { Team, TeamMember } from "@/types/team";
import { AddMemberDialog } from "./AddMemberDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Crown, Trash2 } from "lucide-react";

interface TeamHeaderProps {
  team: Team;
  members?: TeamMember[];
  canManage: boolean;
  canDelete: boolean;
  onDeleteClick: () => void;
}

export function TeamHeader({
  team,
  members,
  canManage,
  canDelete,
  onDeleteClick,
}: TeamHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
        {team.description && (
          <p className="text-sm text-muted-foreground">{team.description}</p>
        )}
        <div className="flex items-center gap-3 pt-1">
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {team._count?.members ?? members?.length ?? 0} members
          </Badge>
          {team.leader && (
            <Badge variant="outline" className="gap-1">
              <Crown className="h-3 w-3" />
              {[team.leader.firstName, team.leader.lastName]
                .filter(Boolean)
                .join(" ") || team.leader.email}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {canManage && members && (
          <AddMemberDialog teamId={team.id} existingMembers={members} />
        )}
        {canDelete && (
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5"
            onClick={onDeleteClick}
          >
            <Trash2 className="h-4 w-4" />
            Delete Team
          </Button>
        )}
      </div>
    </div>
  );
}
