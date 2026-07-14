import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ProfileSettings } from "./ProfileSettings";
import { SecuritySettings } from "./SecuritySettings";
import { VerificationDialog } from "./VerificationDialog";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { Settings, Trash2 } from "lucide-react";
import { useUser } from "@/features/auth/hooks/useUser";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { accountstore } from "../store/store";

export const AccountPage = () => {
  const { data: userdata } = useUser();
  const isGoogle = userdata?.authtype === "google";
  const { setDeleteDialogOpen } = accountstore();

  return (
    <div className="flex h-[92vh] w-full flex-col bg-background">
      <div className="mx-auto w-full max-w-5xl flex-1 overflow-auto">
        <div className="flex flex-col gap-1 mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Settings className="w-7 h-7 text-cyan-500 dark:text-white" />
            Account Settings
          </h1>
          <p className="text-muted-foreground">Manage your profile and security settings.</p>
        </div>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className={isGoogle ? "w-48" : "w-72"}>
            <TabsTrigger value="profile" className="flex-1">
              Profile
            </TabsTrigger>
            {!isGoogle && (
              <TabsTrigger value="security" className="flex-1">
                Security
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>
          {!isGoogle && (
            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>
          )}
        </Tabs>

        <Card className="shadow-md bg-card backdrop-blur-sm mt-8">
          <CardHeader>
            <CardTitle className="text-red-400/80 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-red-400/80">
              Irreversible action — read carefully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg p-3 text-sm text-red-400/90">
              <p className="font-semibold mb-1">What happens when you delete your account?</p>
              <ul className="list-disc list-inside space-y-1 text-red-400/90">
                <li>
                  Your account will be scheduled for <b>permanent deletion</b>
                </li>
                <li>All chats, messages, and service connections will be permanently removed</li>
                <li>
                  You have <b>30 days</b> to cancel by logging back in
                </li>
                <li>After 30 days, the deletion is irreversible</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </CardFooter>
        </Card>

        <VerificationDialog />
        <DeleteAccountDialog />
      </div>
    </div>
  );
};
