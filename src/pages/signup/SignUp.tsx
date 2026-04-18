import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

import "./signup.css";

export function SignUp() {
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const { setCurrentUser } = useAppContext();
  const navigate = useNavigate();

  const handleAuthSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const users: any[] = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.some((user: any) => user.email === authForm.email)) {
      setAuthError("An account with this email already exists.");
      return;
    }

    const newUser = {
      id: String(Date.now()),
      name: authForm.name.trim(),
      email: authForm.email.trim(),
      password: authForm.password,
      role: "customer",
    };
    const nextUsers = [...users, newUser];
    localStorage.setItem("users", JSON.stringify(nextUsers));

    const { password, ...safeUser } = newUser as any;
    void password;
    setCurrentUser(safeUser);
    setAuthError("");
    navigate("/");
  };

  return (
    <section className="section">
      <div className="container auth-page">
        <div className="panel auth-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Create account</span>
              <h2>Join KYKLOS</h2>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleAuthSubmit}>
            <label className="form-grid__full">
              Full name
              <input
                value={authForm.name}
                onChange={(event) =>
                  setAuthForm({ ...authForm, name: event.target.value })
                }
                required
              />
            </label>
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
                Sign up
              </button>
              <div className="auth-switch">
                <p className="muted">Already have an account?</p>
                <Link to="/login" className="text-button">
                  Login
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
