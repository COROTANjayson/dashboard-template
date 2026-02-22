"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useOrganizationStore } from "@/app/store/organization.store";
import { fetchTeam } from "@/services/team.service";
import { TeamsView } from "../components/TeamsView";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const { currentOrganization } = useOrganizationStore();

  const { data: team, isLoading, isError, refetch } = useQuery({
    queryKey: ["team", currentOrganization?.id, teamId],
    queryFn: () => fetchTeam(currentOrganization!.id, teamId),
    enabled: !!currentOrganization?.id && !!teamId,
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !team) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load team</h2>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return <TeamsView team={team} />;
}
