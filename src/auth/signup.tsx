import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { GoogleIcon } from "@/components/ui/googleicon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { useTheme } from "@/components/ui/themeprovider"
import { userauthstore } from "@/store/userauthstore"
import { Eye, EyeOff, Lock, Mail, Moon, Sun, User2 } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import Multimate from "../assets/Multimate.png";
import { AiWaveformScene } from "@/components/layout/animatedscreen"


export const Signup = () => {
    //Store
    const {
        signup,
        loading,
    } = userauthstore();

    //Theme
    const { theme, setTheme } = useTheme();
    const toggletheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    //States
    const [isAgreed, setIsAgreed] = useState<boolean>(false);
    const [username, setusername] = useState<string>("");
    const [useremail, setuseremail] = useState<string>("");
    const [userpassword, setuserpassword] = useState<string>("")
    const [userconfirmpassword, setuserconfirmpassword] = useState<string>("")
    const [show, setshow] = useState<boolean>(false);
    const [show2, setshow2] = useState<boolean>(false);
    

    //Navigate
    const navigate = useNavigate();

    //function

    const Signup = async () => {
        try {
            if (!isAgreed) {
                toast.error("Please read terms and conditons before continuing.")
                return;
            }
            const data = await signup(username, useremail, userpassword, userconfirmpassword);
            if (data.success && data.stateid) {
                navigate(`/verify/${data.stateid}`, {
                    replace: true
                })
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
                        <h1 className="text-4xl font-bold text-cyan-500 dark:text-white tracking-tighter">Create account</h1>
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
                                    <h1 className="text-3xl font-medium">Ready to dive in?</h1>
                                    <p className="text-balance text-muted-foreground">
                                        Create your account to get started.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 mt-5">
                                    <Label htmlFor="Username"><User2 size={15} /> Username</Label>
                                    <Input
                                        value={username}
                                        onChange={(e) => setusername(e.target.value)}
                                        id="Username"
                                        placeholder="Enter Username"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="Useremail"><Mail size={15} /> Useremail</Label>
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
                                        className="absolute right-3 top-7.5 text-muted-foreground"
                                    >
                                        {!show ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <Label htmlFor="Password"><Lock size={15} /> Password</Label>
                                    <Input
                                        value={userpassword}
                                        onChange={(e) => setuserpassword(e.target.value)}
                                        id="password"
                                        type={show ? "text" : "password"}
                                        placeholder="Enter Password"
                                        className="pr-12 "
                                    />
                                </div>
                                <div className="flex flex-col gap-2 relative">
                                    <button
                                        type="button"
                                        onClick={() => setshow2(prev => !prev)}
                                        className="absolute right-3 top-7.5 text-muted-foreground"
                                    >
                                        {!show2 ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <Label htmlFor="CPassword"><Lock size={15} />Confirm Password</Label>
                                    <Input
                                        value={userconfirmpassword}
                                        onChange={(e) => setuserconfirmpassword(e.target.value)}
                                        id="Cpassword"
                                        type={show2 ? "text" : "password"}
                                        placeholder="Enter Confirm Password"
                                        className="pr-12 "
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm">Have an existing account?</p>
                                    <Button variant="link" onClick={() => navigate("/login")}>Login</Button>
                                </div>
                                <div className="w-full">
                                    <Button
                                        disabled={loading}
                                        onClick={Signup}
                                        className="bg-cyan-500 dark:bg-white w-full"
                                    >
                                        {loading ? <Spinner /> : "Create account"}
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