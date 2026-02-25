"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useOrganizationStore } from "@/app/store/organization.store";
import { fetchTeam } from "@/services/team.service";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeamDashboardPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the {team.name} team dashboard.
        </p>
      </div>
      
      {/* Placeholder for future dashboard widgets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Team Description</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-sm text-muted-foreground mt-1">
              {team.description || "No description provided."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
