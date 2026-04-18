
import { useNavigate, Link } from "react-router-dom";
import './forgotPassword.css';


function ForgotPassword() {

  return (
    <section className="section">
      <div className="container auth-page">
        <div className="panel auth-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Welcome back</span>
              <h2>Forgot Password</h2>
            </div>
          </div>
          <form className="form-grid">
            <label className="form-grid__full">
              Email
              <input
                type="email"
                required
              />
            </label>
            <label className="form-grid__full">
              New Password
              <input
                type="password"
                required
              />
            </label>
            <div className="form-grid__full form-actions">
              <button className="button button--dark button--wide" type="submit">
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}


export default ForgotPassword;