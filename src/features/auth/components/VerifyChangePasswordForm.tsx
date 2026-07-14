import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Spinner } from "@/shared/components/ui/spinner";
import { userauthapi } from "@/features/auth/api/api";
import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/components/ui/input-otp";

export const VerifyChangePasswordForm = ({ stateid }: { stateid: string }) => {
  const [loadingverify, setLoadingVerify] = useState(false);
  const [loadingresend, setLoadingResend] = useState(false);
  const [code, setcode] = useState<string>("");
  const [timer, setTimer] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    try {
      setLoadingVerify(true);
      const data = await userauthapi.changepasswordverify(stateid, code);
      if (data.success) {
        toast.success(data.message);
        setTimeout(() => {
          navigate(`/passwordchange/${stateid}`, { replace: true });
        }, 1000);
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
      setLoadingVerify(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      setLoadingResend(true);
      const data = await userauthapi.changepasswordresend(stateid);
      if (data.success) {
        toast.success(data.message);
        setTimer(60);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const Error = err as any;
        const error = Error.response?.data?.message || err.message;
        if (Error.response?.status === 401 || error.toLowerCase().includes("expired")) {
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
        }
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoadingResend(false);
    }
  };

  return (
    <div className="rounded-lg flex flex-col gap-4">
      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-3xl font-medium">Password Change Verification</h1>
        <p className="text-balance text-muted-foreground">
          We have send 6 digits code to your email.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="Code">
          <Lock size={15} />
          Verification Code
        </Label>
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
        <Button disabled={timer > 0 || loadingresend} variant="link" onClick={handleResend}>
          {loadingresend ? <Spinner /> : timer > 0 ? timer : "Resend"}
        </Button>
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          disabled={loadingverify}
          onClick={handleVerify}
          className="bg-cyan-500 dark:bg-white"
        >
          {loadingverify ? <Spinner /> : "Verify"}
        </Button>
        <Button
          className="bg-cyan-500 dark:bg-white"
          onClick={() => {
            userauthapi.clearpasswordchange(stateid);
            navigate("/signup", { replace: true });
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
