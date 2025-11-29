import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <>
      <PageMeta
        title="Reset Password"
        description="Set a new password for your account"
      />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}