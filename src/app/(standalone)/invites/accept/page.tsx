"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as organizationService from "@/services/organization.service";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  // Fetch invitation details
  const { 
    data: inviteDetails, 
    isLoading: isFetching, 
    error: fetchError 
  } = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => organizationService.getInvitationDetails(token!),
    enabled: !!token,
    retry: false,
  });

  // Accept invitation mutation
  const { mutate: acceptInvite, isPending: isAccepting } = useMutation({
    mutationFn: () => organizationService.acceptInvite(token!),
    onSuccess: () => {
        toast.success("Invitation accepted successfully!");
        router.push("/dashboard");
    },
    onError: (err: any) => {
        console.error("Failed to accept invite:", err);
        toast.error(err.response?.data?.message || "Failed to accept invitation");
    }
  });

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Invalid Invitation</CardTitle>
          <CardDescription>The invitation link is invalid or expired.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isFetching) {
      return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Loading Invitation...</CardTitle>
                <CardDescription>Please wait while we verify details.</CardDescription>
            </CardHeader>
             <CardContent className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
        </Card>
      );
  }

  if (fetchError) {
    return (
        <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Invitation Error</CardTitle>
          <CardDescription>{(fetchError as any).response?.data?.message || "Invalid or expired invitation link."}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Accept Invitation</CardTitle>
        <CardDescription>
          You have been invited to join <strong>{inviteDetails?.organization?.name || "an organization"}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {inviteDetails && (
            <div className="flex flex-col gap-2 rounded-lg border p-4 text-sm bg-muted/50">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Organization:</span>
                    <span className="font-medium">{inviteDetails.organization.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Invited by:</span>
                    <span className="font-medium">{inviteDetails.inviter.name}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="font-medium capitalize">{inviteDetails.invitation.role.toLowerCase()}</span>
                </div>
            </div>
        )}
        
        <div className="flex flex-col gap-2">
            <Button onClick={() => acceptInvite()} disabled={isAccepting} className="w-full">
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </Button>
            <Button onClick={() => router.push("/dashboard")} variant="ghost" className="w-full">
                Cancel
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
