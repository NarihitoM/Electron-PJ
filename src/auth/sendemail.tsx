import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { useTheme } from "@/components/ui/themeprovider"
import { userauthstore } from "@/store/userauthstore"
import { Mail, Moon, Sun, } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import Multimate from "../assets/Multimate.png";
import { AiWaveformScene } from "@/components/layout/animatedscreen"
import { Input } from "@/components/ui/input"


export const Emailcheck = () => {


    //Store
    const {
        loadingpasswordchangereset,
        changepasswordreset,
    } = userauthstore();

    //Theme
    const { theme, setTheme } = useTheme();
    const toggletheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    //States
    const [useremail , setuseremail] = useState<string>("");


    //Navigate
    const navigate = useNavigate();


    const verifycodeemail = async () => {
        try {
            const data = await changepasswordreset(
                useremail
            );
            if (data.success) {
                toast.success(data.message);
                setTimeout(() => {
                    navigate(`/verifypasswordchange/${data.stateid}`, {
                        replace: true
                    })
                }, 1000);
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
            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="relative hidden bg-muted lg:block">
                    <div className="absolute inset-0 h-full w-full">
                        <AiWaveformScene theme={theme} />
                    </div>
                    <div className="absolute bottom-10 left-10 z-10 text-white p-6 max-w-sm">
                        <img src={Multimate} className="w-17 h-14 mr-5"></img>
                        <h1 className="text-4xl font-bold text-cyan-500 dark:text-white tracking-tighter">Password Change Verification</h1>
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
                                    <h1 className="text-3xl font-medium">Password Change Verification</h1>
                                    <p className="text-balance text-sm text-muted-foreground">
                                        Please enter your email address. We will send a verification code to change your password.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="Code"><Mail size={15} />Email</Label>
                                    <Input
                                    placeholder="Enter Email"
                                    onChange={(e) => setuseremail(e.target.value)}
                                    value={useremail}
                                    />
                                </div>
                            
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        disabled={loadingpasswordchangereset}
                                        onClick={verifycodeemail}
                                        className="bg-cyan-500 dark:bg-white"
                                    >
                                        {loadingpasswordchangereset ? <Spinner /> : "Send"}
                                    </Button>
                                    <Button
                                        className="bg-cyan-500 dark:bg-white"
                                        onClick={() => {
                                            navigate("/login", {
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