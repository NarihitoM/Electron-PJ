import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { GoogleIcon } from "@/shared/components/ui/googleicon";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Spinner } from "@/shared/components/ui/spinner";
import { userauthapi } from "@/features/auth/api/api";
import { Eye, EyeOff, Lock, User2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [loadinggoogle, setLoadingGoogle] = useState(false);
  const [isAgreed, setIsAgreed] = useState<boolean>(false);
  const [useremail, setuseremail] = useState<string>("");
  const [userpassword, setuserpassword] = useState<string>("");
  const [show, setshow] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      if (!isAgreed) {
        toast.error("Please read terms and conditons before continuing.");
        return;
      }
      if (!useremail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(useremail)) {
        toast.error("Please enter a valid email address.");
        return;
      }
      if (!userpassword || userpassword.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
      setLoading(true);
      const data = await userauthapi.login(useremail, userpassword);
      if (data.success) {
        if (data.token) {
          await (window as any).api.savetoken(data.token);
        }
        toast.success(data.message);
        setTimeout(() => {
          navigate("/app/dashboard", { replace: true });
        }, 2000);
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

  const handleGoogleLogin = async () => {
    if (!isAgreed) {
      toast.error("Please read terms and conditons before continuing.");
      return;
    }
    try {
      setLoadingGoogle(true);
      const response = await (window as any).api.googlelogin();
      if (response && response.success) {
        const acesstoken = response.access_token;
        if (!acesstoken) return;
        const data = await userauthapi.googlelogin(acesstoken);
        if (data.success) {
          if (data.token) {
            await (window as any).api.savetoken(data.token);
          }
          toast.success(data.message);
          setTimeout(() => {
            navigate("/app/dashboard", { replace: true });
          }, 2000);
        }
      } else {
        toast.error(response.error || "It seems something went wrong.");
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
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="rounded-lg flex flex-col gap-4">
      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-3xl font-medium">Welcome Back!</h1>
        <p className="text-balance text-muted-foreground">We are thrilled to see you back again!</p>
      </div>
      <div className="flex flex-col gap-2 mt-5">
        <Label htmlFor="Useremail">
          <User2 size={15} /> Useremail
        </Label>
        <Input
          value={useremail}
          onChange={(e) => setuseremail(e.target.value)}
          id="Useremail"
          placeholder="Enter Email"
        />
      </div>
      <div className="flex flex-col gap-1 relative">
        <button
          type="button"
          onClick={() => setshow((prev) => !prev)}
          className="absolute right-3 top-10.5 text-muted-foreground"
        >
          {!show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        <div className="flex items-center justify-between">
          <Label htmlFor="password" title="Password" className="flex items-center gap-2">
            <Lock size={15} /> Password
          </Label>
          <Button type="button" variant="link" onClick={() => navigate("/emailverify")}>
            Forgot password?
          </Button>
        </div>
        <Input
          value={userpassword}
          onChange={(e) => setuserpassword(e.target.value)}
          id="password"
          type={show ? "text" : "password"}
          placeholder="Enter Password"
          className="pr-12"
        />
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm">Don't have an account?</p>
        <Button variant="link" onClick={() => navigate("/signup")}>
          Signup
        </Button>
      </div>
      <div className="w-full">
        <Button
          disabled={loading}
          onClick={handleLogin}
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
        <Button
          onClick={handleGoogleLogin}
          disabled={loadinggoogle}
          variant="outline"
          className="w-full rounded-full"
        >
          {loadinggoogle ? (
            <Spinner />
          ) : (
            <>
              <GoogleIcon /> Google
            </>
          )}
        </Button>
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
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-cyan-500 dark:text-white hover:underline font-medium"
          >
            terms and conditions.
          </a>
        </div>
      </div>
    </div>
  );
};
