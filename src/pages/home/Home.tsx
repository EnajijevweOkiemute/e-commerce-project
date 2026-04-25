import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collections, metrics } from "../../constant";
import "./home.css";

export function Home() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
  
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero__overlay" />
        <img
          className="hero__image"
          style={{ transform: `translateY(${scrollY * 0.35}px) scale(1.15)`, transformOrigin: "bottom" }}
          src="https://images.unsplash.com/photo-1590691820318-8cc33afb725e?w=1800&auto=format&fit=crop"
          alt="Luxury collection"
        />
        <div className="container hero__content">
          <h1>Refined Luxury</h1>
          <p>
            Discover premium timepieces and accessories <br />
            that define modern elegance.
          </p>
          <div className="hero__actions">
            <button className="button button--dark" onClick={() => navigate("/shop")}>
              Explore Collection
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "0.5rem" }}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Featured Collections</span>
              <h2>Curated around precision, craft, and presence.</h2>
            </div>
            <button className="text-button" onClick={() => navigate("/shop")}>
              Shop everything
            </button>
          </div>
          <div className="collection-grid">
            {collections.map((collection) => (
              <article className="collection-card" key={collection.title}>
                <img src={collection.image} alt={collection.title} />
                <div className="collection-card__content">
                  <h3>{collection.title}</h3>
                  <p>{collection.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <div className="metrics-grid">
            {metrics.map((item) => (
              <article className="metric-card" key={item.title}>
                <strong>{item.value}</strong>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container spotlight">
          <div>
            <span className="eyebrow">Private client service</span>
            <h2>Elevate your style with pieces built to last.</h2>
            <p>
              Join a growing list of customers who trust Kyklos for premium quality,
              concierge-level support, and a clean shopping experience.
            </p>
          </div>
          <button className="button button--dark" onClick={() => navigate("/shop")}>
            Shop Now
          </button>
        </div>
      </section>
    </>
  );
}
