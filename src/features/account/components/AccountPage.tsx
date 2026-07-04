import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { ProfileSettings } from "./ProfileSettings"
import { SecuritySettings } from "./SecuritySettings"
import { VerificationDialog } from "./VerificationDialog"

export const AccountPage = () => {
    return (
        <div className="space-y-6">
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <ProfileSettings />
                </TabsContent>
                <TabsContent value="security">
                    <SecuritySettings />
                </TabsContent>
            </Tabs>
            <VerificationDialog />
        </div>
    )
}