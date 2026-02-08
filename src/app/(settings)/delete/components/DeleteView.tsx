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
        {/* TODO: Implement delete account functionality */}
      </div>
    </SettingsPageContainer>
  );
}

