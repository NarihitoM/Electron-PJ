import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/components/ui/input-otp";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { toast } from "sonner";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { accountauth } from "../api/api";
import { useLogout } from "../hooks/useLogout";
import { accountstore } from "../store/store";

export const VerificationDialog = () => {
  const {
    openverify,
    code,
    timer,
    stateid,
    loadingpasswordresend,
    loadingpasswordverify,
    setOpenverify,
    setCode,
    setTimer,
    setLoadingpasswordverify,
    setLoadingpasswordresend,
  } = accountstore();
  const navigate = useNavigate();
  const { mutateAsync: logout } = useLogout();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer(timer - 1), 1000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const handleVerify = async () => {
    try {
      setLoadingpasswordverify(true);
      const response = await accountauth.passwordverify(stateid, code);
      if (response.success) {
        setOpenverify(true);
        toast.success(response.message);
        setTimeout(() => {
          logout();
          navigate("/login", { replace: true });
        }, 2000);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const error = (err as any).response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoadingpasswordverify(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      setLoadingpasswordresend(true);
      const data = await accountauth.passwordresend(stateid);
      if (data.success) {
        toast.success(data.message);
        setTimer(60);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const error = (err as any).response?.data?.message || err.message;
        toast.error(error);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoadingpasswordresend(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setOpenverify(false);
      accountauth.clearpasswordcode(stateid);
    }
  };

  return (
    <Dialog open={openverify} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Verification Code</DialogTitle>
          <DialogDescription>Please enter the 6 digit codes sent to your email.</DialogDescription>
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
          <Button
            disabled={timer > 0 || loadingpasswordresend}
            variant="link"
            onClick={handleResend}
          >
            {loadingpasswordresend ? <Spinner /> : timer > 0 ? timer : "Resend"}
          </Button>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button
            disabled={loadingpasswordverify}
            className="bg-cyan-500 dark:bg-white"
            onClick={handleVerify}
          >
            {loadingpasswordverify ? <Spinner /> : "Verify"}
          </Button>
          <Button variant="destructive" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
