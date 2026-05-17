import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { GoogleIcon } from "@/components/ui/googleicon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { useTheme } from "@/components/ui/themeprovider"
import { userauthstore } from "@/store/userauthstore"
import { Eye, EyeOff, Lock, Moon, Sun, User2 } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import Multimate from "../assets/Multimate.png";
import { AiWaveformScene } from "@/components/layout/animatedscreen"

export const Login = () => {


    //Store
    const {
        login,
        loading
    } = userauthstore();

    //Theme
    const { theme, setTheme } = useTheme();
    const toggletheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    //States
    const [isAgreed, setIsAgreed] = useState<boolean>(false);
    const [useremail, setuseremail] = useState<string>("");
    const [userpassword, setuserpassword] = useState<string>("")
    const [show, setshow] = useState<boolean>(false);

    //Navigate
    const navigate = useNavigate();

    //function

    const Login = async () => {
        try {
            if (!isAgreed) {
                toast.error("Please read terms and conditons before continuing.")
                return;
            }
            const data = await login(useremail, userpassword);
            if (data.success) {
                toast.success(data.message);
                setTimeout(() => {
                    navigate("/app/dashboard", {
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
                        <h1 className="text-4xl font-bold text-cyan-500 dark:text-white tracking-tighter">Login</h1>
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
                                    <h1 className="text-3xl font-medium">Welcome Back!</h1>
                                    <p className="text-balance text-muted-foreground">
                                        We are thrilled to see you back again!
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 mt-5">
                                    <Label htmlFor="Useremail"><User2 size={15} /> Useremail</Label>
                                    <Input
                                        value={useremail}
                                        onChange={(e) => setuseremail(e.target.value)}
                                        id="Useremail"
                                        placeholder="Enter Email"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 relative">
                                    <button
                                        type="button"
                                        onClick={() => setshow(prev => !prev)}
                                        className="absolute right-3 top-11.5 text-muted-foreground"
                                    >
                                        {!show ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" title="Password" className="flex items-center gap-2">
                                            <Lock size={15} /> Password
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="link"
                                            onClick={() => navigate("/emailverify")}
                                        >
                                            Forgot password?
                                        </Button>
                                    </div>
                                    <Input
                                        value={userpassword}
                                        onChange={(e) => setuserpassword(e.target.value)}
                                        id="password"
                                        type={show ? "text" : "password"}
                                        placeholder="Enter Password"
                                        className="pr-12 "
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm">Don't have an account?</p>
                                    <Button variant="link" onClick={() => navigate("/signup")}>Signup</Button>
                                </div>
                                <div className="w-full">
                                    <Button
                                        disabled={loading}
                                        onClick={Login}
                                        className="bg-cyan-500 dark:bg-white w-full"
                                    >
                                        {loading ? <Spinner /> : "Login"}
                                    </Button>
                                </div>
                                <div className="relative w-full">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-200" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white dark:bg-background px-2 text-muted-foreground">
                                            Or continue with
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 w-full gap-4">
                                    <Button variant="outline" className="w-full rounded-full">
                                        <GoogleIcon />
                                        Google
                                    </Button>
                                </div>
                            </div>
                            <div className="w-full gap-2 flex justify-center items-center mt-5">
                                <Checkbox
                                    id="terms"
                                    checked={isAgreed}
                                    className="checked:bg-cyan-500 dark:checked:bg-white"
                                    onCheckedChange={(checked) => setIsAgreed(checked === true)}
                                />
                                <div className="flex items-center text-[12px] text-muted-foreground">
                                    <label htmlFor="terms" className="cursor-pointer">
                                        I have read and agree to the
                                    </label>
                                    <a
                                        href="https://www.google.com"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="ml-1 text-cyan-500 dark:text-white hover:underline font-medium"
                                    >
                                        terms and conditions.
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}