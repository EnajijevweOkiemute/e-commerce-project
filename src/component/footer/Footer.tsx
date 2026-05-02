import { Link } from "react-router-dom";
import "./footer.css";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          {/* Brand Section */}
          <div className="footer-brand">
            <h3 className="footer-logo">KYKLOS</h3>
            <p className="footer-tagline">
              Refined luxury for the modern collector. Timeless pieces crafted with precision.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Instagram" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4 className="footer-heading">Shop</h4>
              <Link to="/shop?category=Watches" className="footer-link">Watches</Link>
              <Link to="/shop?category=Bags" className="footer-link">Bags</Link>
              <Link to="/shop?category=Accessories" className="footer-link">Accessories</Link>
              <Link to="/shop" className="footer-link">All Products</Link>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Support</h4>
              <a href="#" className="footer-link">Contact Us</a>
              <a href="#" className="footer-link">Shipping & Returns</a>
              <a href="#" className="footer-link">FAQ</a>
              <a href="#" className="footer-link">Size Guide</a>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Company</h4>
              <a href="#" className="footer-link">About Us</a>
              <a href="#" className="footer-link">Careers</a>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Newsletter</h4>
              <p className="footer-newsletter-text">
                Subscribe to receive updates, access to exclusive deals, and more.
              </p>
              <form className="footer-newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="footer-newsletter-input"
                  required
                />
                <button type="submit" className="footer-newsletter-btn">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Kyklos. All rights reserved.
          </p>
          <div className="footer-payment">
            <span className="footer-payment-text">We accept</span>
            <div className="footer-payment-icons">
              <svg width="38" height="24" viewBox="0 0 38 24" fill="none">
                <rect width="38" height="24" rx="4" fill="#1A1F71"/>
                <text x="19" y="16" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">VISA</text>
              </svg>
              <svg width="38" height="24" viewBox="0 0 38 24" fill="none">
                <rect width="38" height="24" rx="4" fill="#EB001B"/>
                <circle cx="14" cy="12" r="7" fill="#FF5F00"/>
                <circle cx="24" cy="12" r="7" fill="#F79E1B"/>
              </svg>
              <svg width="38" height="24" viewBox="0 0 38 24" fill="none">
                <rect width="38" height="24" rx="4" fill="#016FD0"/>
                <text x="19" y="16" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">AMEX</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
