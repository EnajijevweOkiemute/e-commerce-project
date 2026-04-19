import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PasswordRulesBox } from "../../component/auth/PasswordRulesBox";
import { useAppContext } from "../../context/AppContext";
import { resetPassword, sanitizeUser, validatePasswordComplexity, getPasswordResetToken } from "../../utils/auth";
import "../forgotPassword/forgotPassword.css";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentUser } = useAppContext();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = searchParams.get("token") || "";

  const resetToken = useMemo(() => (token ? getPasswordResetToken(token) : null), [token]);
  const tokenState = useMemo(() => {
    if (!token || !resetToken) return "invalid";
    if (resetToken.usedAt) return "used";
    if (new Date(resetToken.expiresAt).getTime() < Date.now()) return "expired";
    return "valid";
  }, [resetToken, token]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const passwordError = validatePasswordComplexity(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = resetPassword(token, password);
    if (result.error || !result.user) {
      setError(result.error || "Unable to reset password.");
      return;
    }

    setCurrentUser(sanitizeUser(result.user));
    setSuccess("Password updated. You are now signed in.");
    setError("");
    window.setTimeout(() => navigate(result.user.role === "admin" ? "/admin-dashboard" : "/dashboard"), 1200);
  };

  return (
    <section className="section">
      <div className="container auth-page">
        <div className="panel auth-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Reset access</span>
              <h2>Choose a new password</h2>
            </div>
          </div>

          {tokenState !== "valid" ? (
            <div className="form-grid">
              <p className="form-error form-grid__full">
                {tokenState === "used"
                  ? "This reset link has already been used."
                  : tokenState === "expired"
                    ? "This reset link has expired."
                    : "This reset link is invalid."}
              </p>
              <Link className="button button--dark button--wide form-grid__full" to="/forgot-password">
                Request another link
              </Link>
            </div>
          ) : (
            <form className="form-grid" onSubmit={handleSubmit}>
              <label className="form-grid__full">
                New password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <label className="form-grid__full">
                Confirm password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </label>
              <div className="form-grid__full">
                <PasswordRulesBox value={password} />
              </div>
              {error ? <p className="form-error form-grid__full">{error}</p> : null}
              {success ? <p className="form-success form-grid__full">{success}</p> : null}
              <div className="form-grid__full form-actions">
                <button className="button button--dark button--wide" type="submit">
                  Save new password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
