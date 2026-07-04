import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/components/ui/input-otp"
import { Button } from "@/shared/components/ui/button"
import { Spinner } from "@/shared/components/ui/spinner"

export const VerificationDialog = ({
    open,
    onOpenChange,
    code,
    setCode,
    timer,
    loadingpasswordresend,
    loadingpasswordverify,
    onVerify,
    onResend,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    code: string;
    setCode: (v: string) => void;
    timer: number;
    loadingpasswordresend: boolean;
    loadingpasswordverify: boolean;
    onVerify: () => void;
    onResend: () => void;
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Enter Verification Code</DialogTitle>
                    <DialogDescription>
                        Please enter the 6 digit codes sent to your email.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col w-full gap-2">
                    <Label htmlFor="code">Code</Label>
                    <InputOTP maxLength={6} value={code} className="w-full" onChange={(value) => setCode(value)}>
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
                    <Button disabled={timer > 0 || loadingpasswordresend} variant="link" onClick={onResend}>
                        {loadingpasswordresend ? <Spinner /> : timer > 0 ? timer : "Resend"}
                    </Button>
                </div>
                <DialogFooter className="sm:justify-end">
                    <Button disabled={loadingpasswordverify} className="bg-cyan-500 dark:bg-white" onClick={onVerify}>
                        {loadingpasswordverify ? <Spinner /> : "Verify"}
                    </Button>
                    <Button variant="destructive" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
