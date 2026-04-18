import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { User } from "../../types";
import "./login.css";

export function Login() {
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const { setCurrentUser } = useAppContext();
  const navigate = useNavigate();

  const handleAuthSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");

    const foundUser = users.find(
      (user: any) => user.email === authForm.email && user.password === authForm.password
    );

    if (!foundUser) {
      setAuthError("Invalid email or password.");
      return;
    }

    const { password, ...safeUser } = foundUser as any;
    void password;
    setCurrentUser(safeUser);
    setAuthError("");
    navigate(safeUser.role === "admin" ? "/admin" : "/");
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
              <input
                type="password"
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm({ ...authForm, password: event.target.value })
                }
                required
              />
            </label>
            {authError && <p className="form-error" style={{ color: 'red' }}>{authError}</p>}
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
