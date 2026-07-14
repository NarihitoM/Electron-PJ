import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { SendEmailForm } from "@/features/auth/components/SendEmailForm";

export const Emailcheck = () => {
  return (
    <AuthLayout title="Password Change Verification">
      <SendEmailForm />
    </AuthLayout>
  );
};
