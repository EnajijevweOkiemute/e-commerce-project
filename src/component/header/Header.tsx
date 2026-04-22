import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { NotificationBell } from "./NotificationBell";
import "./header.css";

export function Header() {
  const { cartCount, currentUser, setCurrentUser } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const userInitials = currentUser?.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  useEffect(() => {
    if (location.pathname !== "/shop") return;
    const query = new URLSearchParams(location.search).get("search") ?? "";
    setSearchTerm(query);
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
  };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <div className="site-header__left">
          <Link to="/" className="site-header__logo">
            KYKLOS
          </Link>
          <nav className="site-header__nav">
            <Link to="/shop">Shop</Link>
            {currentUser?.role === "customer" ? <Link to="/dashboard">Dashboard</Link> : null}
            {currentUser?.role === "customer" ? <Link to="/orders">Orders</Link> : null}
            {currentUser?.role === "admin" ? <Link to="/admin-dashboard">Admin</Link> : null}
          </nav>
        </div>
        
       

        <div className="site-header__actions">
          <NotificationBell />
          <Link to="/cart" className="cart-link" aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          {currentUser ? (
            <Link
              to={currentUser.role === "admin" ? "/admin-dashboard" : "/dashboard"}
              className="header-avatar"
              aria-label={`${currentUser.name} profile`}
              title={currentUser.name}
            >
              <span className="header-avatar__image" aria-hidden="true">
                {userInitials || currentUser.name[0]?.toUpperCase()}
              </span>
              <span className="header-avatar__meta">
                <strong>{currentUser.name}</strong>
                <small>{currentUser.role}</small>
              </span>
            </Link>
          ) : null}
          {currentUser ?  null : (
              <Link to='/signup' className="text-button">Sign Up</Link>
          )}
        
          {currentUser ? (
            <button className="button button--dark header-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="button button--dark header-btn">
              Login
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}
