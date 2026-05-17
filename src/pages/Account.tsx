import { User, Lock, Shield, Trash2, EyeOff, Eye, Upload, Trash } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { userauthstore } from "@/store/userauthstore"
import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { userauthapi } from "@/api/userauth"
import { useNavigate } from "react-router-dom"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

export const Account = () => {

    //Store
    const {
        userdata,
        userupdate,
        loadingupdate,
        passwordreset,
        passwordverify,
        passwordresend,
        clearpasscode,
        loadingpassword,
        loadingpasswordresend,
        loadingpasswordverify,
    } = userauthstore()

    //Navigate
    const navigate = useNavigate();


    //States
    const [username, setusername] = useState<string>(userdata?.username!);
    const [currentpassword, setcurrentpassword] = useState<string>("");
    const [show, setshow] = useState<boolean>(false);
    const [show1, setshow1] = useState<boolean>(false);
    const [newpassword, setnewpassword] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const [openverify, setopenverify] = useState<boolean>(false);
    const [stateid, setstateid] = useState<string>("");
    const [timer, setTimer] = useState<number>(0);
    const [file, setfile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filepreview = e.target.files?.[0];
        if (!filepreview) return;

        setfile(filepreview);

        const url = URL.createObjectURL(filepreview);
        setPreview(url);

        e.target.value = "";
    };

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);


    //Functions
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [timer]);

    const updateuser = async () => {
        try {
            const formdata = new FormData();
            formdata.append("file", file ?? "");
            formdata.append("username", username);

            const response = await userupdate(
               formdata
            );
            if (response.success) {
                toast.success(response.message);
            }
        }
        catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                const error = Error.response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.")
            }
        }
    }

    const Passwordreset = async () => {
        try {
            const response = await passwordreset(
                currentpassword,
                newpassword
            )
            if (response.success) {
                setopenverify(true);
                setstateid(response.stateid);
                toast.success(response.message);
            }
        }
        catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                const error = Error.response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.")
            }
        }
    }

    const Passwordverify = async () => {
        try {
            const response = await passwordverify(
                stateid,
                code
            )
            if (response.success) {
                setopenverify(true);
                toast.success(response.message);
                setTimeout(() => {
                    userauthapi.logout();
                    navigate("/login", {
                        replace: true
                    })
                }, 2000);
            }
        }
        catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                const error = Error.response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.")
            }
        }
    }


    const Passwordresend = async () => {
        if (timer > 0) return;
        try {
            const data = await passwordresend(
                stateid
            );
            if (data.success) {
                toast.success(data.message);
                setTimer(60);
            }
        }
        catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                const error = Error.response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.")
            }
        }
    }


    return (
        <>
            <Toaster position="top-right" richColors />
            <Dialog open={openverify} onOpenChange={(open) => {
                if (!open) {
                    setopenverify(false);
                    clearpasscode(stateid);
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enter Verification Code</DialogTitle>
                        <DialogDescription>
                            Please enter the 6 digit codes sent to your email.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col w-full gap-2">
                        <Label htmlFor="code">Code</Label>
                        <InputOTP
                            maxLength={6}
                            value={code}
                            className="w-full"
                            onChange={(value) => setCode(value)}
                        >
                            <InputOTPGroup className="gap-3">
                                <InputOTPSlot index={0} className="h-14 w-14 text-xl" />
                                <InputOTPSlot index={1} className="h-14 w-14 text-xl" />
                                <InputOTPSlot index={2} className="h-14 w-14 text-xl" />
                                <InputOTPSlot index={3} className="h-14 w-14 text-xl" />
                                <InputOTPSlot index={4} className="h-14 w-14 text-xl" />
                                <InputOTPSlot index={5} className="h-14 w-14 text-xl" />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    <div className="flex items-center">
                        <p className="text-sm">Don't receive code?</p>
                        <Button disabled={timer > 0 || loadingpasswordresend} variant="link" onClick={Passwordresend}>
                            {loadingpasswordresend ?
                                <Spinner />
                                : timer > 0 ? timer :
                                    "Resend"}</Button>
                    </div>
                    <DialogFooter className="sm:justify-end">
                        <Button
                            disabled={loadingpasswordverify}
                            className="bg-cyan-500 dark:bg-white"
                            onClick={Passwordverify}
                        >
                            {loadingpasswordverify ? <Spinner /> : "Verify"}
                        </Button>
                        <Button variant="destructive" onClick={() => {
                            setopenverify(false)
                            clearpasscode(stateid)
                        }}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="container w-full mx-auto max-w-5xl ">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">Account Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences.</p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6 mt-5">
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="profile" className="gap-2">
                            <User size={16} /> Profile
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Lock size={16} /> Security
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-4">
                        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Profile Setting</CardTitle>
                                <CardDescription className="font-bold">Configure your user account</CardDescription>
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
                                    <div className="flex flex-col gap-1.5">
                                        <h1 className="text-lg">Upload image</h1>
                                        <p className="text-muted-foreground">JPG, PNG, Or JPEG, max 5MB</p>
                                        <div className="flex gap-2 w-full">
                                            <Button variant="outline" className="w-1/2" onClick={() => fileRef.current?.click()}><Upload /> Upload</Button>
                                            {preview && <Button variant="destructive" onClick={() => setPreview("")}><Trash />Remove</Button>}
                                            <input
                                                type="file"
                                                ref={fileRef}
                                                hidden
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" placeholder="Username" className="max-w-md" value={username} onChange={(e) => setusername(e.target.value)} />
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
                                <Button onClick={updateuser} disabled={(username === userdata?.username && !preview) || loadingupdate} className="bg-cyan-500 dark:bg-white">{loadingupdate ? <Spinner /> : "Save Changes"}</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-4">
                        {userdata?.authtype === "User" && <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
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
                                        <button
                                            type="button"
                                            onClick={() => setshow(prev => !prev)}
                                            className="absolute right-3 top-7.5 text-muted-foreground"
                                        >
                                            {!show ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        <Label htmlFor="currentpass"><Lock size={15} />Enter Old Password</Label>
                                        <Input
                                            value={currentpassword}
                                            onChange={(e) => setcurrentpassword(e.target.value)}
                                            id="currentpass"
                                            type={show ? "text" : "password"}
                                            placeholder="Enter Current Password"
                                            className="pr-12 "
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 relative">
                                        <button
                                            type="button"
                                            onClick={() => setshow1(prev => !prev)}
                                            className="absolute right-3 top-7.5 text-muted-foreground"
                                        >
                                            {!show1 ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        <Label htmlFor="newpass"><Lock size={15} />Enter New Password</Label>
                                        <Input
                                            value={newpassword}
                                            onChange={(e) => setnewpassword(e.target.value)}
                                            id="newpass"
                                            type={show1 ? "text" : "password"}
                                            placeholder="Enter New Password"
                                            className="pr-12 "
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t pt-6 mt-4">
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Shield size={14} className="text-green-500" />Your account is protected
                                </div>
                                <Button onClick={Passwordreset} disabled={loadingpassword || !currentpassword || !newpassword} className="bg-cyan-500 dark:bg-white">{loadingpassword ? <Spinner /> : "Update"}</Button>
                            </CardFooter>
                        </Card>}

                        <Card className="border-red-500/20 bg-red-500/5">
                            <CardHeader>
                                <CardTitle className="dark:text-red-400 text-red-600 flex items-center gap-2">
                                    <Trash2 size={18} /> Danger Zone
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm dark:text-red-400 text-red-600">Permanently delete your account and all of your content.</p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="destructive">Delete Account</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}