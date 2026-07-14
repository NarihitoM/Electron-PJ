import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const Login = () => {
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { logoutSuccess?: boolean } | null;
    if (state?.logoutSuccess) {
      toast.success("Logged out successfully.");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <AuthLayout title="Login">
      <LoginForm />
    </AuthLayout>
  );
};
