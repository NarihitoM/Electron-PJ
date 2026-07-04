import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Spinner } from "@/shared/components/ui/spinner";
import { userauthapi } from "@/features/auth/api/api";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const ChangePasswordForm = ({ stateid }: { stateid: string }) => {
    const [loading, setLoading] = useState(false);
    const [userpassword, setuserpassword] = useState<string>("");
    const [show, setshow] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleChange = async () => {
        try {
            setLoading(true);
            const data = await userauthapi.changepassword(stateid, userpassword);
            if (data.success) {
                toast.success(data.message);
                setTimeout(() => { navigate("/login", { replace: true }); }, 1000);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const Error = err as any;
                const error = Error.response?.data?.message || err.message;
                toast.error(error);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-lg flex flex-col gap-4">
            <div className="flex flex-col gap-2 items-center">
                <h1 className="text-3xl font-medium">New Password</h1>
                <p className="text-balance text-sm text-muted-foreground">Please enter your new password.</p>
            </div>
            <div className="flex flex-col gap-2 relative">
                <button type="button" onClick={() => setshow(prev => !prev)} className="absolute right-3 top-7.5 text-muted-foreground">
                    {!show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <Label htmlFor="Password"><Lock size={15} /> Password</Label>
                <Input value={userpassword} onChange={(e) => setuserpassword(e.target.value)} id="password" type={show ? "text" : "password"} placeholder="Enter Password" className="pr-12" />
            </div>
            <div className="flex gap-2 justify-end">
                <Button disabled={loading} onClick={handleChange} className="bg-cyan-500 dark:bg-white">
                    {loading ? <Spinner /> : "Change"}
                </Button>
                <Button className="bg-cyan-500 dark:bg-white" onClick={() => { userauthapi.clearpasswordchange(stateid); navigate("/login", { replace: true }); }}>
                    Cancel
                </Button>
            </div>
        </div>
    );
};
