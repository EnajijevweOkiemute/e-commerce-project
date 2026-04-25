import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { PasswordRulesBox } from "../../component/auth/PasswordRulesBox";
import { Toast } from "../../component/ui/Toast";
import { config } from "../../config/env";
import "./signup.css";

const WATCH_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80&auto=format&fit=crop";

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

export function SignUp() {
  const [authForm, setAuthForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { setCurrentUser } = useAppContext();
  const navigate = useNavigate();

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (authForm.password !== authForm.confirmPassword) {
      setToast({ message: "Passwords do not match.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${config.apiBaseUrl}/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: authForm.firstName,
          lastName: authForm.lastName,
          email: authForm.email,
          password: authForm.password,
          confirmPassword: authForm.confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message =
          data?.message ||
          (Array.isArray(data?.errors) ? data.errors[0] : null) ||
          "Registration failed. Please try again.";
        setToast({ message, type: "error" });
        return;
      }

      localStorage.setItem("authToken", data.token);
      setCurrentUser({
        id: data.user.id,
        name: `${data.user.firstName} ${data.user.lastName}`,
        email: data.user.email,
        role: data.user.userType?.toLowerCase() === "admin" ? "admin" : "customer",
      });

      setToast({ message: "Account created successfully!", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch {
      setToast({ message: "Network error. Please check your connection.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="signup-split">
        <div className="signup-split__image">
          <img src={WATCH_IMAGE} alt="Luxury watch" />
          <div className="signup-split__image-overlay">
            <h2>Time, crafted to perfection.</h2>
            <p>Discover our curated collection of premium timepieces.</p>
          </div>
        </div>
        <div className="signup-split__form">
          <div className="signup-split__form-inner">

            <button className="signup-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>

            <span className="signup-eyebrow">Create account</span>
            <h2 className="signup-heading">Join KYKLOS</h2>

            <form className="signup-form" onSubmit={handleAuthSubmit}>
              <div className="signup-name-row">
                <div className="signup-field">
                  <label htmlFor="signup-firstname">First name</label>
                  <input
                    id="signup-firstname"
                    value={authForm.firstName}
                    onChange={(e) => setAuthForm({ ...authForm, firstName: e.target.value })}
                    placeholder="John"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="signup-field">
                  <label htmlFor="signup-lastname">Last name</label>
                  <input
                    id="signup-lastname"
                    value={authForm.lastName}
                    onChange={(e) => setAuthForm({ ...authForm, lastName: e.target.value })}
                    placeholder="Doe"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="signup-field">
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="signup-field">
                <label htmlFor="signup-password">Password</label>
                <div className="signup-input-wrap">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button type="button" className="signup-eye-btn" onClick={() => setShowPassword((p) => !p)} aria-label="Toggle password">
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <div className="signup-field">
                <label htmlFor="signup-confirm">Confirm password</label>
                <div className="signup-input-wrap">
                  <input
                    id="signup-confirm"
                    type={showConfirm ? "text" : "password"}
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button type="button" className="signup-eye-btn" onClick={() => setShowConfirm((p) => !p)} aria-label="Toggle confirm password">
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </div>

              <PasswordRulesBox value={authForm.password} />

              <button className="signup-submit-btn" type="submit" disabled={loading}>
                {loading ? <span className="signup-spinner" /> : "Sign up"}
              </button>

              <div className="signup-switch">
                <p>Already have an account?</p>
                <Link to="/login" className="text-button">Login</Link>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}
