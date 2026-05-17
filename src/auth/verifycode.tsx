import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { useTheme } from "@/components/ui/themeprovider"
import { userauthstore } from "@/store/userauthstore"
import { Lock, Moon, Sun, } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import Multimate from "../assets/Multimate.png";
import { AiWaveformScene } from "@/components/layout/animatedscreen"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"


export const Verify = () => {

    const { stateid } = useParams();

    //Store
    const {
        verifycode,
        resendcode,
        loadingverify,
        loadingresend,
        clearcode
    } = userauthstore();

    //Theme
    const { theme, setTheme } = useTheme();
    const toggletheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    //States
    const [code, setcode] = useState<string>("");
    const [timer, setTimer] = useState<number>(0);


    //Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [timer]);


    //Navigate
    const navigate = useNavigate();


    const verifycodesignup = async () => {
        try {
            const data = await verifycode(
                stateid!,
                code
            );
            if (data.success) {
                toast.success(data.message);
                setTimeout(() => {
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

    const resendverifycode = async () => {
        if (timer > 0) return;
        try {
            const data = await resendcode(
                stateid!
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
                const statusCode = Error.response?.status;
                toast.error(error);

                if (statusCode === 401 || error.toLowerCase().includes("expired")) {
                    setTimeout(() => {
                        navigate("/signup", { replace: true });
                    }, 2000);
                }

            } else {
                toast.error("An unexpected error occurred.")
            }
        }
    }


    useEffect(() => {
        if (!stateid) {
            navigate("/signup", { replace: true });
        }
    }, [stateid, navigate]);

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="relative hidden bg-muted lg:block">
                    <div className="absolute inset-0 h-full w-full">
                        <AiWaveformScene theme={theme} />
                    </div>
                    <div className="absolute bottom-10 left-10 z-10 text-white p-6 max-w-sm">
                        <img src={Multimate} className="w-17 h-14 mr-5"></img>
                        <h1 className="text-4xl font-bold text-cyan-500 dark:text-white tracking-tighter">Account Verification</h1>
                        <h1 className="text-3xl font-bold text-cyan-500 dark:text-white tracking-tighter mt-3">MultimateAi</h1>
                        <p className="text-muted-foreground dark:text-white mt-2 opacity-80">Your all in one agentic orchestration software.</p>
                    </div>
                </div>
                <div className="flex flex-col gap-4 p-10">
                    <div className="flex justify-between  gap-2">
                        <a href="#" className="flex items-center gap-2 font-medium">
                            <img src={Multimate} className="w-12 h-10"></img>
                            <span className="font-medium">MultimateAi</span>
                        </a>
                        <button
                            onClick={toggletheme}
                            className="p-2 rounded-md border bg-background"
                        >
                            {theme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-xs">
                            <div className="rounded-lg flex flex-col gap-4">
                                <div className="flex flex-col gap-2 items-center">
                                    <h1 className="text-3xl font-medium">Account Verification</h1>
                                    <p className="text-balance text-sm text-muted-foreground">
                                        We have send 6 digits code to your email.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="Code"><Lock size={15} />Verification Code</Label>
                                    <InputOTP
                                        maxLength={6}
                                        value={code}
                                        className="w-full"
                                        onChange={(value) => setcode(value)}
                                    >
                                        <InputOTPGroup className="gap-3">
                                            <InputOTPSlot index={0} className="w-11 h-10 text-xl" />
                                            <InputOTPSlot index={1} className="w-11 h-10 text-xl" />
                                            <InputOTPSlot index={2} className="w-11 h-10 text-xl" />
                                            <InputOTPSlot index={3} className="w-11 h-10 text-xl" />
                                            <InputOTPSlot index={4} className="w-11 h-10 text-xl" />
                                            <InputOTPSlot index={5} className="w-11 h-10 text-xl" />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                <div className="flex items-center">
                                    <p className="text-sm">Don't receive code?</p>
                                    <Button disabled={timer > 0 || loadingresend} variant="link" onClick={resendverifycode}>
                                        {loadingresend ?
                                            <Spinner />
                                            : timer > 0 ? timer :
                                                "Resend"}</Button>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        disabled={loadingverify}
                                        onClick={verifycodesignup}
                                        className="bg-cyan-500 dark:bg-white"
                                    >
                                        {loadingverify ? <Spinner /> : "Verify"}
                                    </Button>
                                    <Button
                                        className="bg-cyan-500 dark:bg-white"
                                        onClick={() => {
                                            clearcode(stateid!);
                                            navigate("/signup", {
                                                replace: true
                                            })
                                        }}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}