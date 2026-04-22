import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { collections, metrics } from "../../constant";
import "./home.css";

type CoverflowClass =
  | "coverflow-item--active"
  | "coverflow-item--prev"
  | "coverflow-item--next"
  | "coverflow-item--far-prev"
  | "coverflow-item--far-next"
  | "coverflow-item--hidden";

function getItemClass(index: number, current: number, total: number): CoverflowClass {
  const diff = index - current;
  const wrappedDiff = ((diff + total) % total <= total / 2)
    ? (diff + total) % total
    : (diff + total) % total - total;

  if (wrappedDiff === 0)  return "coverflow-item--active";
  if (wrappedDiff === -1) return "coverflow-item--prev";
  if (wrappedDiff === 1)  return "coverflow-item--next";
  if (wrappedDiff === -2) return "coverflow-item--far-prev";
  if (wrappedDiff === 2)  return "coverflow-item--far-next";
  return "coverflow-item--hidden";
}

export function Home() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % collections.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % collections.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + collections.length) % collections.length);
  }, [currentSlide, goToSlide]);

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

      <section className="marquee-section">
        <div className="marquee-track">
          <div className="marquee-content">
            <span className="marquee-item">✦ Free Shipping on Orders Over $500</span>
            <span className="marquee-item">✦ 30-Day Money Back Guarantee</span>
            <span className="marquee-item">✦ Exclusive Member Discounts</span>
            <span className="marquee-item">✦ Authenticity Certified</span>
            <span className="marquee-item">✦ Complimentary Gift Wrapping</span>
            <span className="marquee-item">✦ Free Shipping on Orders Over $500</span>
            <span className="marquee-item">✦ 30-Day Money Back Guarantee</span>
            <span className="marquee-item">✦ Exclusive Member Discounts</span>
            <span className="marquee-item">✦ Authenticity Certified</span>
            <span className="marquee-item">✦ Complimentary Gift Wrapping</span>
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
          </div>

          <div className="coverflow-carousel">
            <div className="coverflow-stage">
              {collections.map((collection, index) => (
                <article
                  key={index}
                  className={`coverflow-item ${getItemClass(index, currentSlide, collections.length)}`}
                  onClick={() => {
                    const cls = getItemClass(index, currentSlide, collections.length);
                    if (cls === "coverflow-item--prev" || cls === "coverflow-item--far-prev") prevSlide();
                    else if (cls === "coverflow-item--next" || cls === "coverflow-item--far-next") nextSlide();
                    else navigate("/shop");
                  }}
                >
                  <div className="coverflow-item__image-wrapper">
                    <img src={collection.image} alt={collection.title} />
                  </div>
                  <div className="coverflow-item__content">
                    <h3>{collection.title}</h3>
                    <p>{collection.description}</p>
                  </div>
                </article>
              ))}

              <button className="coverflow-btn coverflow-btn--prev" onClick={prevSlide} aria-label="Previous">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <button className="coverflow-btn coverflow-btn--next" onClick={nextSlide} aria-label="Next">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            {/* Caption */}
            <p className="coverflow-caption">{collections[currentSlide]?.title}</p>

            {/* Indicators */}
            <div className="carousel-indicators">
              {collections.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-indicator ${index === currentSlide ? "active" : ""}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
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