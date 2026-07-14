import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { SignupForm } from "@/features/auth/components/SignupForm";

export const Signup = () => {
  return (
    <AuthLayout title="Create account">
      <SignupForm />
    </AuthLayout>
  );
};
