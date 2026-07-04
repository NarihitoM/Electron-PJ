import { Upload, Trash } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Button } from "@/shared/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Spinner } from "@/shared/components/ui/spinner"

interface UserData { username: string; useremail: string; profileurl?: string; authtype: string }

export const ProfileSettings = ({
    userdata,
    username,
    setUsername,
    preview,
    setPreview,
    loadingupdate,
    onSave,
    fileRef,
    onFileChange,
}: {
    userdata: UserData | null | undefined;
    username: string;
    setUsername: (v: string) => void;
    preview: string | null;
    setPreview: (v: string | null) => void;
    loadingupdate: boolean;
    onSave: () => void;
    fileRef: React.RefObject<HTMLInputElement>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
    return (
        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>{userdata?.authtype === "User" ? "Profile Setting" : "Google Profile Setting"}</CardTitle>
                {userdata?.authtype === "User" && <CardDescription className="font-bold">Configure your user account</CardDescription>}
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
                                <Button variant="outline" className="w-1/2" onClick={() => fileRef.current?.click()}><Upload /> Upload</Button>
                                {preview && <Button variant="destructive" onClick={() => setPreview("")}><Trash />Remove</Button>}
                                <input type="file" ref={fileRef} hidden accept="image/*" onChange={onFileChange} />
                            </div>
                        </div>
                    )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" disabled={userdata?.authtype === "google"} placeholder="Username" className="max-w-md" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" disabled placeholder="Useremail" className="max-w-md" value={userdata?.useremail} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="auth">Authentication Type</Label>
                    <Input id="auth" className="max-w-md" disabled value={userdata?.authtype === "User" ? "Multimate Account" : "Google Account"} />
                </div>
            </CardContent>
            <CardFooter>
                {userdata?.authtype === "User" && (
                    <Button onClick={onSave} disabled={(username === userdata?.username && !preview) || loadingupdate} className="bg-cyan-500 dark:bg-white">
                        {loadingupdate ? <Spinner /> : "Save Changes"}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};
