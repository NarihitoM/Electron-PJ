import { Upload, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Spinner } from "@/shared/components/ui/spinner";
import { useUser } from "@/features/auth/hooks/useUser";
import { accountauth } from "../api/api";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { accountstore } from "../store/store";

export const ProfileSettings = () => {
  const { data: userdata, refetch } = useUser();
  const { username, preview, loadingupdate, setUsername, setPreview, setLoadingupdate } =
    accountstore();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userdata?.username) setUsername(userdata.username);
  }, [userdata?.username]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filepreview = e.target.files?.[0];
    if (!filepreview) return;
    setPreview(URL.createObjectURL(filepreview));
    e.target.value = "";
  };

  const handleSave = async () => {
    try {
      setLoadingupdate(true);
      const formdata = new FormData();
      if (fileRef.current?.files?.[0]) formdata.append("file", fileRef.current.files[0]);
      formdata.append("username", username);
      const response = await accountauth.userupdate(formdata);
      if (response.success) {
        toast.success(response.message);
        setPreview("");
        refetch();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const error = (err as any).response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoadingupdate(false);
    }
  };

  return (
    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{userdata?.authtype === "User" ? "Profile" : "Google Profile"}</CardTitle>
        {userdata?.authtype === "User" && (
          <CardDescription className="font-bold">Configure your user account</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={
                preview
                  ? preview
                  : userdata?.profileurl
                    ? `${userdata.profileurl}?v=${userdata.useremail}`
                    : undefined
              }
            />
            <AvatarFallback className="bg-cyan-500 text-2xl dark:bg-white border text-white dark:text-black">
              {userdata?.username.substring(0, 1)}
            </AvatarFallback>
          </Avatar>
          {userdata?.authtype === "User" && (
            <div className="flex flex-col gap-1.5">
              <h1 className="text-lg">Upload image</h1>
              <p className="text-muted-foreground">JPG, PNG, Or JPEG, max 5MB</p>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="w-1/2"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload /> Upload
                </Button>
                {preview && (
                  <Button variant="destructive" onClick={() => setPreview("")}>
                    <Trash />
                    Remove
                  </Button>
                )}
                <input
                  type="file"
                  ref={fileRef}
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            disabled={userdata?.authtype === "google"}
            placeholder="Username"
            className="max-w-md"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            disabled
            placeholder="Useremail"
            className="max-w-md"
            value={userdata?.useremail}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="auth">Authentication Type</Label>
          <Input
            id="auth"
            className="max-w-md"
            disabled
            value={userdata?.authtype === "User" ? "Multimate Account" : "Google Account"}
          />
        </div>
      </CardContent>
      <CardFooter>
        {userdata?.authtype === "User" && (
          <Button
            onClick={handleSave}
            disabled={(username === userdata?.username && !preview) || loadingupdate}
            className="bg-cyan-500 dark:bg-white"
          >
            {loadingupdate ? <Spinner /> : "Save Changes"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
