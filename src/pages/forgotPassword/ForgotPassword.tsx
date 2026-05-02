import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPasswordResetRequest, getResetEmails } from "../../utils/auth";
import "./forgotPassword.css";

const WATCH_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80&auto=format&fit=crop";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [latestLink, setLatestLink] = useState("");
  const navigate = useNavigate();
  const resetEmails = getResetEmails();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = createPasswordResetRequest(email);
    if (result.error) {
      setError(result.error);
      setSuccess("");
      setLatestLink("");
      return;
    }

    setError("");
    setSuccess(`Reset link prepared for ${email.trim().toLowerCase()}.`);
    setLatestLink(result.resetLink || "");
  };

  return (
    <div className="forgot-split">
      <div className="forgot-split__image">
        <img src={WATCH_IMAGE} alt="Luxury watch" />
        <div className="forgot-split__image-overlay">
          <h2>Time, crafted to perfection.</h2>
          <p>Discover our curated collection of premium timepieces.</p>
        </div>
      </div>

      <div className="forgot-split__form">
        <div className="forgot-split__form-inner">

          <button className="forgot-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>

          <span className="forgot-eyebrow">Password recovery</span>
          <h2 className="forgot-heading">Forgot Password</h2>
          <p className="forgot-subheading">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form className="forgot-form" onSubmit={handleSubmit}>

            <div className="forgot-field">
              <label htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {error && <p className="forgot-error">{error}</p>}
            {success && <p className="forgot-success">{success}</p>}

            <button className="forgot-submit-btn" type="submit">
              Send reset link
            </button>

            <div className="forgot-back-link">
              <Link to="/login" className="text-button">Back to login</Link>
            </div>

          </form>

          {latestLink && (
            <div className="forgot-preview">
              <span className="forgot-preview-eyebrow">Email preview</span>
              <h3>Reset email sent</h3>
              <p>Open the generated link to continue the password reset flow.</p>
              <a href={latestLink} className="forgot-preview-btn">
                Open reset link
              </a>
            </div>
          )}

          {resetEmails.length > 0 && (
            <div className="forgot-preview">
              <span className="forgot-preview-eyebrow">Outbox</span>
              <h3>Recent password reset emails</h3>
              <div className="forgot-mail-list">
                {resetEmails.slice(0, 3).map((mail) => (
                  <article className="forgot-mail-item" key={mail.id}>
                    <div>
                      <strong>{mail.to}</strong>
                      <p className="muted">{new Date(mail.createdAt).toLocaleString()}</p>
                    </div>
                    <a className="text-button" href={mail.resetLink}>
                      Open link
                    </a>
                  </article>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
