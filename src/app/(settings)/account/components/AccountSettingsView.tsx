"use client";

import { useState } from "react";
import { useAuthStore } from "@/app/store/auth.store";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SettingsPageContainer } from "@/components/settings/SettingsPageContainer";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { SettingsPageHeaderContainer } from "@/components/settings/SettingsPageHeaderContainer";

export function AccountSettingsView() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await authService.updatePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Password updated successfully");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update password";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsPageContainer>
      <SettingsPageHeaderContainer>
        <SettingsPageHeader 
          title="Account Settings" 
          description="Manage your account preferences and settings." 
        />
      </SettingsPageHeaderContainer>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Email Address</CardTitle>
            <CardDescription>
              Your email address is used for sign-in and notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-sm space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                To change your email address, please contact support.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-sm">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input
                  type="password"
                  id="oldPassword"
                  placeholder="Enter current password"
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  type="password"
                  id="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </SettingsPageContainer>
  );
}
