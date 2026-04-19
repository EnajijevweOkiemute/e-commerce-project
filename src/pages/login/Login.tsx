import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { authenticateUser, sanitizeUser } from "../../utils/auth";
import "./login.css";

export function Login() {
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setCurrentUser } = useAppContext();
  const navigate = useNavigate();

  const handleAuthSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const foundUser = authenticateUser(authForm.email, authForm.password);

    if (!foundUser) {
      setAuthError("Invalid email or password.");
      return;
    }

    const safeUser = sanitizeUser(foundUser);
    setCurrentUser(safeUser);
    setAuthError("");
    navigate(safeUser.role === "admin" ? "/admin-dashboard" : "/dashboard");
  };

  return (
    <section className="section">
      <div className="container auth-page">
        <div className="panel auth-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Welcome back</span>
              <h2>Member login</h2>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleAuthSubmit}>
            <label className="form-grid__full">
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={(event) =>
                  setAuthForm({ ...authForm, email: event.target.value })
                }
                required
              />
            </label>
            <label className="form-grid__full">
              Password
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={authForm.password}
                  onChange={(event) =>
                    setAuthForm({ ...authForm, password: event.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
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
            </label>
            {authError && <p className="form-error" style={{ color: 'red' }}>{authError}</p>}
            <div className="form-grid__full form-actions">
              <button className="forget-password" type="button">
                <Link to='/forgot-password' className="text-button">
                  Forget Password
                </Link>
              </button>
            </div>
            <div className="form-grid__full form-actions">
              <button className="button button--dark button--wide" type="submit">
                Login
              </button>
              <div className="auth-switch">
                <p className="muted">Don't have an account?</p>
                <Link to="/signup" className="text-button">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}