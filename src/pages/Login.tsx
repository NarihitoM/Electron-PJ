import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const Login = () => {
    return (
        <AuthLayout title="Login">
            <LoginForm />
        </AuthLayout>
    );
};
