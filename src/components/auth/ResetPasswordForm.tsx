import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!token) {
      setErrorMsg("Invalid or missing reset token");
      return;
    }
    if (!password || !confirm) {
      setErrorMsg("Please enter and confirm your new password");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match");
      return;
    }
    setLoading(true);
    const res = await resetPassword({ token, new_password: password });
    setLoading(false);
    if (res.success) {
      navigate("/signin");
    } else {
      setErrorMsg(res.error || "Failed to reset password");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Set New Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter a new password for your account.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>
              {errorMsg && <div className="text-error-500 text-sm">{errorMsg}</div>}
              <div>
                <Button className="w-full" size="sm" disabled={loading}>
                  {loading ? "Saving..." : "Save Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}