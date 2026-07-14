import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { VerifyChangePasswordForm } from "@/features/auth/components/VerifyChangePasswordForm";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const Verifychangepassword = () => {
  const { stateid } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!stateid) {
      navigate("/signup", { replace: true });
    }
  }, [stateid, navigate]);

  if (!stateid) return null;

  return (
    <AuthLayout title="Password Change Verification">
      <VerifyChangePasswordForm stateid={stateid} />
    </AuthLayout>
  );
};
