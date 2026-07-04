import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { VerifyCodeForm } from "@/features/auth/components/VerifyCodeForm";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const Verify = () => {
    const { stateid } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!stateid) {
            navigate("/signup", { replace: true });
        }
    }, [stateid, navigate]);

    if (!stateid) return null;

    return (
        <AuthLayout title="Account Verification">
            <VerifyCodeForm stateid={stateid} />
        </AuthLayout>
    );
};
