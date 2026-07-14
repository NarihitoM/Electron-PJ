import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Spinner } from "@/shared/components/ui/spinner";
import { userauthapi } from "@/features/auth/api/api";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const SendEmailForm = () => {
  const [loading, setLoading] = useState(false);
  const [useremail, setuseremail] = useState<string>("");
  const navigate = useNavigate();

  const verifycodeemail = async () => {
    try {
      setLoading(true);
      const data = await userauthapi.changepasswordreset(useremail);
      if (data.success) {
        toast.success(data.message);
        setTimeout(() => {
          navigate(`/verifypasswordchange/${data.stateid}`, { replace: true });
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
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg flex flex-col gap-4">
      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-3xl font-medium">Password Change Verification</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Please enter your email address. We will send a verification code to change your password.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="Code">
          <Mail size={15} />
          Email
        </Label>
        <Input
          placeholder="Enter Email"
          onChange={(e) => setuseremail(e.target.value)}
          value={useremail}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button disabled={loading} onClick={verifycodeemail} className="bg-cyan-500 dark:bg-white">
          {loading ? <Spinner /> : "Send"}
        </Button>
        <Button
          className="bg-cyan-500 dark:bg-white"
          onClick={() => {
            navigate("/login", { replace: true });
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
