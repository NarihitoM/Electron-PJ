import { Lock, Shield, EyeOff, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
import { Spinner } from "@/shared/components/ui/spinner"

export const SecuritySettings = ({
    currentpassword,
    setCurrentpassword,
    newpassword,
    setNewpassword,
    show,
    setShow,
    show1,
    setShow1,
    loadingpassword,
    onUpdate,
}: {
    currentpassword: string;
    setCurrentpassword: (v: string) => void;
    newpassword: string;
    setNewpassword: (v: string) => void;
    show: boolean;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    show1: boolean;
    setShow1: React.Dispatch<React.SetStateAction<boolean>>;
    loadingpassword: boolean;
    onUpdate: () => void;
}) => {
    return (
        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Security Setting</CardTitle>
                <CardDescription className="font-bold">Manage your password</CardDescription>
                <CardDescription>For security purpose, we cant show the password to user.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Separator />
                <div className="grid gap-3">
                    <h1 className="font-semibold">Update Password</h1>
                    <div className="flex flex-col gap-2 mt-2 relative">
                        <button type="button" onClick={() => setShow(prev => !prev)} className="absolute right-3 top-7.5 text-muted-foreground">
                            {!show ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <Label htmlFor="currentpass"><Lock size={15} />Enter Old Password</Label>
                        <Input
                            value={currentpassword}
                            onChange={(e) => setCurrentpassword(e.target.value)}
                            id="currentpass"
                            type={show ? "text" : "password"}
                            placeholder="Enter Current Password"
                            className="pr-12"
                        />
                    </div>
                    <div className="flex flex-col gap-2 relative">
                        <button type="button" onClick={() => setShow1(prev => !prev)} className="absolute right-3 top-7.5 text-muted-foreground">
                            {!show1 ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <Label htmlFor="newpass"><Lock size={15} />Enter New Password</Label>
                        <Input
                            value={newpassword}
                            onChange={(e) => setNewpassword(e.target.value)}
                            id="newpass"
                            type={show1 ? "text" : "password"}
                            placeholder="Enter New Password"
                            className="pr-12"
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6 mt-4">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Shield size={14} className="text-green-500" />Your account is protected
                </div>
                <Button onClick={onUpdate} disabled={loadingpassword || !currentpassword || !newpassword} className="bg-cyan-500 dark:bg-white">
                    {loadingpassword ? <Spinner /> : "Update"}
                </Button>
            </CardFooter>
        </Card>
    );
};
