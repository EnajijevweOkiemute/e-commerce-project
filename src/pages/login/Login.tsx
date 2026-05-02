import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { Toast } from "../../component/ui/Toast";
import { config } from "../../config/env";
import "./login.css";

const WATCH_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80&auto=format&fit=crop";

export function Login() {
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setCurrentUser } = useAppContext();
  const navigate = useNavigate();

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${config.apiBaseUrl}/v1/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authForm.email, password: authForm.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message =
          data?.message ||
          (Array.isArray(data?.errors) ? data.errors[0] : null) ||
          "Invalid email or password.";
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

      setToast({ message: "Welcome back!", type: "success" });
      const destination =
        data.user.userType?.toLowerCase() === "admin" ? "/admin-dashboard" : "/dashboard";
      setTimeout(() => navigate(destination), 1000);
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

      <div className="login-split">
        <div className="login-split__image">
          <img src={WATCH_IMAGE} alt="Luxury watch" />
          <div className="login-split__image-overlay">
            <h2>Time, crafted to perfection.</h2>
            <p>Discover our curated collection of premium timepieces.</p>
          </div>
        </div>
        <div className="login-split__form">
          <div className="login-split__form-inner">

            <button className="login-back-btn" onClick={() => navigate("/")} aria-label="Go back">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>

            <span className="login-eyebrow">Welcome back</span>
            <h2 className="login-heading">Member login</h2>

            <form className="login-form" onSubmit={handleAuthSubmit}>

              <div className="login-field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="login-field">
                <label htmlFor="login-password">Password</label>
                <div className="login-input-wrap">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
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
                    )}
                  </button>
                </div>
              </div>

              <div className="login-forgot">
                <Link to="/forgot-password" className="text-button">Forgot password?</Link>
              </div>

              <button className="login-submit-btn" type="submit" disabled={loading}>
                {loading ? <span className="login-spinner" /> : "Login"}
              </button>

              <div className="login-switch">
                <p>Don't have an account?</p>
                <Link to="/signup" className="text-button">Sign up</Link>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
}
