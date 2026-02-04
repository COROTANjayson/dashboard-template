import { SettingsPageContainer } from "@/components/settings/SettingsPageContainer";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { SettingsPageHeaderContainer } from "@/components/settings/SettingsPageHeaderContainer";

export function DeleteView() {
  return (
    <SettingsPageContainer>
      <SettingsPageHeaderContainer>
        <SettingsPageHeader 
          title="Delete Account" 
          description="Permanently delete your account and all associated data." 
        />
      </SettingsPageHeaderContainer>
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Delete Page</h1>
      </div>
    </SettingsPageContainer>
  );
}

