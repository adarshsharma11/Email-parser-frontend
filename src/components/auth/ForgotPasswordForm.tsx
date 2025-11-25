import { useState } from "react";
import { Link, useNavigate } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { authService } from "../../services";

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <div className="flex flex-col flex-1">
      
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Forgot Password?
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email address and we'll send you a password reset link.
            </p>
          </div>
          <div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setErrorMsg("");
                setSuccessMsg("");
                
                if (!email) {
                  setErrorMsg("Email is required");
                  return;
                }
                
                setLoading(true);
                try {
                  const res = await authService.forgotPassword(email);
                  setLoading(false);
                  
                  if (res.success) {
                    setSuccessMsg("Password reset link has been sent to your email. Please check your inbox.");
                    setTimeout(() => {
                      navigate("/signin");
                    }, 3000);
                  } else {
                    setErrorMsg(res.error || "Failed to send password reset email");
                  }
                } catch (error) {
                  setLoading(false);
                  console.error('Password reset error:', error);
                  setErrorMsg("An error occurred while sending the password reset email");
                }
              }}
            >
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    type="email" 
                    placeholder="Enter your email address" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                
                {successMsg && (
                  <div className="text-success-500 text-sm bg-success-50 p-3 rounded-lg">
                    {successMsg}
                  </div>
                )}
                
                {errorMsg && (
                  <div className="text-error-500 text-sm bg-error-50 p-3 rounded-lg">
                    {errorMsg}
                  </div>
                )}
                
                <div>
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Sending..." : "Send Password Reset Link"}
                  </Button>
                </div>
            </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Remember your password? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
