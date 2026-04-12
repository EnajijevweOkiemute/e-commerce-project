import "./footer.css";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <h3>Kyklos</h3>
          <p>Refined luxury for the modern collector.</p>
        </div>
        <div className="site-footer__links">
          <div>
            <strong>Shop</strong>
            <a href="#">Watches</a>
            <a href="#">Bags</a>
            <a href="#">Accessories</a>
          </div>
          <div>
            <strong>Support</strong>
            <a href="#">Contact Us</a>
            <a href="#">Shipping & Returns</a>
            <a href="#">FAQ</a>
          </div>
          <div>
            <strong>Company</strong>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <p>&copy; {new Date().getFullYear()} Kyklos . All rights reserved.</p>
      </div>
    </footer>
  );
}
