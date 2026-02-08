"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/app/store/auth.store";
import { authService } from "@/services/auth.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { User, UpdateUserPayload } from "@/types/auth";
import { User as UserIcon, Mail, Calendar, UserCircle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { SettingsPageHeaderContainer } from "@/components/settings/SettingsPageHeaderContainer";
import { SettingsPageContainer } from "@/components/settings/SettingsPageContainer";

export function ProfileView() {
  const setUser = useAuthStore((state) => state.setUser);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  // Fetch latest user data
  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ["user-profile"],
    queryFn: authService.getMe,
  });

  const [formData, setFormData] = useState<UpdateUserPayload>({
    firstName: "",
    lastName: "",
    age: 0,
    gender: "",
  });

  // Sync form data when user data is fetched
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        age: user.age || 0,
        gender: user.gender || "",
      });
      // Sync store as well to ensure parity
      setUser(user);
    }
  }, [user, setUser]);

  // Update mutation
  const { mutate: handleUpdate, isPending } = useMutation({
    mutationFn: (payload: UpdateUserPayload) => authService.updateMe(payload),
    onSuccess: (updatedUser: User) => {
      setUser(updatedUser);
      setIsSuccessVisible(true);
      setTimeout(() => setIsSuccessVisible(false), 3000);
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load profile</h2>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <SettingsPageContainer>
      <SettingsPageHeaderContainer>
        <SettingsPageHeader 
          title="Profile Settings" 
          description="Manage your account information and preferences." 
        />
      </SettingsPageHeaderContainer>

      <div className="flex flex-col-reverse gap-8 md:grid md:grid-cols-[1fr_250px]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-none bg-accent/40 backdrop-blur-sm shadow-xl transition-all hover:shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Personal Information</CardTitle>
              <CardDescription>
                Update your name, age, and other details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        className="pl-9 bg-background/50 border-accent focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        className="pl-9 bg-background/50 border-accent focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      className="pl-9 bg-muted/50 text-muted-foreground cursor-not-allowed border-none"
                      value={user?.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Age</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="age"
                        type="number"
                        className="pl-9 bg-background/50 border-accent focus:ring-2 focus:ring-primary/20 transition-all"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender</Label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          setFormData({ ...formData, gender: value })
                        }
                      >
                        <SelectTrigger className="pl-9 bg-background/50 border-accent focus:ring-2 focus:ring-primary/20 transition-all">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="private">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className={cn(
                    "flex items-center gap-2 text-sm font-medium text-emerald-500 transition-all duration-300",
                    isSuccessVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
                  )}>
                    <CheckCircle2 className="h-4 w-4" />
                    Profile updated successfully
                  </div>
                  <Button 
                    type="submit" 
                    className="ml-auto px-8 relative overflow-hidden group shadow-lg hover:shadow-primary/25 transition-all"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-accent/40 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-2 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
                <span className="text-3xl font-bold">
                  {(user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase()}
                </span>
              </div>
              <CardTitle className="text-lg">{user?.firstName} {user?.lastName}</CardTitle>
              <CardDescription className="text-xs break-all">
                {user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex flex-col gap-1 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verified Status</span>
                <span className={cn(
                  "text-xs font-semibold px-2 py-1 rounded-full",
                  user?.isEmailVerified ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                )}>
                  {user?.isEmailVerified ? "Email Verified" : "Verification Pending"}
                </span>
              </div>
              <div className="pt-4 border-t border-accent/30 text-[10px] text-muted-foreground flex flex-col gap-1">
                <span>Created: {new Date(user?.createdAt || "").toLocaleDateString()}</span>
                <span>Last Updated: {new Date(user?.updatedAt || "").toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SettingsPageContainer>
  );
}

