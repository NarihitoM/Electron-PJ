import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";
import { useParams } from "react-router-dom";

export const Passwordchange = () => {
  const { stateid } = useParams();

  if (!stateid) return null;

  return (
    <AuthLayout title="New Password">
      <ChangePasswordForm stateid={stateid} />
    </AuthLayout>
  );
};
