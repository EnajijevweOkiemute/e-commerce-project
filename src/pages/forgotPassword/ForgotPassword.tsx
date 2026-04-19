import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { createPasswordResetRequest, getResetEmails } from "../../utils/auth";
import "./forgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [latestLink, setLatestLink] = useState("");
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
    <section className="section">
      <div className="container auth-page">
        <div className="panel auth-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Welcome back</span>
              <h2>Forgot Password</h2>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="form-grid__full">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            {error ? <p className="form-error form-grid__full">{error}</p> : null}
            {success ? <p className="form-success form-grid__full">{success}</p> : null}
            <div className="form-grid__full form-actions">
              <button className="button button--dark button--wide" type="submit">
                Send reset link
              </button>
              <Link to="/login" className="text-button">
                Back to login
              </Link>
            </div>
          </form>

          {latestLink ? (
            <div className="panel auth-preview-card">
              <span className="eyebrow">Email preview</span>
              <h3>Reset email sent</h3>
              <p className="muted">Open the generated link to continue the password reset flow.</p>
              <a href={latestLink} className="button button--dark">
                Open reset link
              </a>
            </div>
          ) : null}

          <div className="panel auth-preview-card">
            <span className="eyebrow">Outbox</span>
            <h3>Recent password reset emails</h3>
            {resetEmails.length ? (
              <div className="mail-list">
                {resetEmails.slice(0, 3).map((mail) => (
                  <article className="mail-list__item" key={mail.id}>
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
            ) : (
              <p className="muted">No password reset emails have been generated yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ForgotPassword;
