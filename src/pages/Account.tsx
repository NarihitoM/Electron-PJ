import { User, Lock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { useUser } from "@/features/auth/hooks/useUser"
import { userauthapi } from "@/features/auth/api/api"
import { useEffect, useRef, useState } from "react"
import { Toaster } from "@/shared/components/ui/sonner";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom"
import { ProfileSettings } from "@/features/account/components/ProfileSettings"
import { SecuritySettings } from "@/features/account/components/SecuritySettings"
import { VerificationDialog } from "@/features/account/components/VerificationDialog"

export const Account = () => {
    const { data: userdata, refetch } = useUser()
    const [loadingupdate, setLoadingUpdate] = useState(false)
    const [loadingpassword, setLoadingPassword] = useState(false)
    const [loadingpasswordverify, setLoadingPasswordVerify] = useState(false)
    const [loadingpasswordresend, setLoadingPasswordResend] = useState(false)

    const navigate = useNavigate();

    const [username, setusername] = useState<string>(userdata?.username ?? "");
    useEffect(() => { if (userdata?.username) setusername(userdata.username); }, [userdata?.username]);

    const [currentpassword, setcurrentpassword] = useState<string>("");
    const [show, setshow] = useState<boolean>(false);
    const [show1, setshow1] = useState<boolean>(false);
    const [newpassword, setnewpassword] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const [openverify, setopenverify] = useState<boolean>(false);
    const [stateid, setstateid] = useState<string>("");
    const [timer, setTimer] = useState<number>(0);
    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filepreview = e.target.files?.[0];
        if (!filepreview) return;
        setPreview(URL.createObjectURL(filepreview));
        e.target.value = "";
    };

    useEffect(() => {
        return () => { if (preview) URL.revokeObjectURL(preview); };
    }, [preview]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const updateuser = async () => {
        try {
            setLoadingUpdate(true);
            const formdata = new FormData();
            if (fileRef.current?.files?.[0]) formdata.append("file", fileRef.current.files[0]);
            formdata.append("username", username);
            const response = await userauthapi.userupdate(formdata);
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
                toast.error("An unexpected error occurred.")
            }
        } finally {
            setLoadingUpdate(false);
        }
    }

    const Passwordreset = async () => {
        if (!currentpassword || !newpassword) { toast.error("Please fill in all password fields."); return; }
        if (newpassword.length < 6) { toast.error("New password must be at least 6 characters."); return; }
        if (currentpassword === newpassword) { toast.error("New password must be different from current password."); return; }
        try {
            setLoadingPassword(true);
            const response = await userauthapi.passwordreset(currentpassword, newpassword);
            if (response.success) {
                setopenverify(true);
                setstateid(response.stateid);
                toast.success(response.message);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const error = (err as any).response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            setLoadingPassword(false);
        }
    }

    const Passwordverify = async () => {
        try {
            setLoadingPasswordVerify(true);
            const response = await userauthapi.passwordverify(stateid, code);
            if (response.success) {
                setopenverify(true);
                toast.success(response.message);
                setTimeout(() => {
                    userauthapi.logout();
                    navigate("/login", { replace: true });
                }, 2000);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const error = (err as any).response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            setLoadingPasswordVerify(false);
        }
    }

    const Passwordresend = async () => {
        if (timer > 0) return;
        try {
            setLoadingPasswordResend(true);
            const data = await userauthapi.passwordresend(stateid);
            if (data.success) { toast.success(data.message); setTimer(60); }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const error = (err as any).response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.")
            }
        } finally {
            setLoadingPasswordResend(false);
        }
    }

    return (
        <>
            <Toaster position="top-right" richColors />
            <VerificationDialog
                open={openverify}
                onOpenChange={(open) => {
                    if (!open) { setopenverify(false); userauthapi.clearpasswordcode(stateid); }
                }}
                code={code}
                setCode={setCode}
                timer={timer}
                loadingpasswordresend={loadingpasswordresend}
                loadingpasswordverify={loadingpasswordverify}
                onVerify={Passwordverify}
                onResend={Passwordresend}
            />
            <div className="container w-full mx-auto max-w-5xl">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">Account Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences.</p>
                </div>
                <Tabs defaultValue="profile" className="space-y-6 mt-5">
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="profile" className="gap-2"><User size={16} /> Profile</TabsTrigger>
                        {userdata?.authtype === "User" && <TabsTrigger value="security" className="gap-2"><Lock size={16} /> Security</TabsTrigger>}
                    </TabsList>
                    <TabsContent value="profile" className="space-y-4">
                        <ProfileSettings
                            userdata={userdata}
                            username={username}
                            setUsername={setusername}
                            preview={preview}
                            setPreview={setPreview}
                            loadingupdate={loadingupdate}
                            onSave={updateuser}
                            fileRef={fileRef}
                            onFileChange={handleFileChange}
                        />
                    </TabsContent>
                    <TabsContent value="security" className="space-y-4">
                        {userdata?.authtype === "User" && (
                            <SecuritySettings
                                currentpassword={currentpassword}
                                setCurrentpassword={setcurrentpassword}
                                newpassword={newpassword}
                                setNewpassword={setnewpassword}
                                show={show}
                                setShow={setshow}
                                show1={show1}
                                setShow1={setshow1}
                                loadingpassword={loadingpassword}
                                onUpdate={Passwordreset}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}
