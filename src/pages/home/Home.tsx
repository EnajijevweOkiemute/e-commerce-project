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
  const wrappedDiff =
    (diff + total) % total <= total / 2
      ? (diff + total) % total
      : (diff + total) % total - total;

  if (wrappedDiff === 0) return "coverflow-item--active";
  if (wrappedDiff === -1) return "coverflow-item--prev";
  if (wrappedDiff === 1) return "coverflow-item--next";
  if (wrappedDiff === -2) return "coverflow-item--far-prev";
  if (wrappedDiff === 2) return "coverflow-item--far-next";
  return "coverflow-item--hidden";
}

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=1800&q=85&auto=format&fit=crop",
    title: "Refined Luxury",
    description: "Discover premium timepieces and accessories that define modern elegance.",
  },
  {
    image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1800&q=85&auto=format&fit=crop",
    title: "Timeless Craft",
    description: "Every piece is a testament to precision engineering and enduring style.",
  },
  {
    image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=1800&q=85&auto=format&fit=crop",
    title: "Modern Elegance",
    description: "Curated collections for those who appreciate the finer things in life.",
  },
];

export function Home() {
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = heroSlides[heroIndex];

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 550);
    },
    [isTransitioning]
  );

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
        {heroSlides.map((slide, i) => {
          const offset = i - heroIndex;
          return (
            <img
              key={i}
              className="hero__image"
              style={{ transform: `translateX(${offset * 100}%)` }}
              src={slide.image}
              alt={slide.title}
            />
          );
        })}
        <div className="container hero__content">
          <h1 className="hero__title">{current.title}</h1>
          <p className="hero__desc">{current.description}</p>
          <div className="hero__actions">
            <button className="hero__cta" onClick={() => navigate("/shop")}>
              Explore Collection
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "0.5rem" }}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </section>
      <section className="collections-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Featured Collections</span>
            <h2 className="section-title">Curated around precision, craft, and presence.</h2>
          </div>

          <div className="coverflow-carousel">
            <div className="coverflow-stage">
              {collections.map((collection, index) => (
                <article
                  key={index}
                  className={`coverflow-item ${getItemClass(index, currentSlide, collections.length)}`}
                  onClick={() => {
                    const cls = getItemClass(index, currentSlide, collections.length);
                    if (cls.includes("prev")) prevSlide();
                    else if (cls.includes("next")) nextSlide();
                    else navigate("/shop");
                  }}
                >
                  <div className="coverflow-item__image">
                    <img src={collection.image} alt={collection.title} />
                  </div>
                  <div className="coverflow-item__info">
                    <h3>{collection.title}</h3>
                    <p>{collection.description}</p>
                  </div>
                </article>
              ))}

              <button
                className="coverflow-nav coverflow-nav--prev"
                onClick={prevSlide}
                aria-label="Previous collection"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                className="coverflow-nav coverflow-nav--next"
                onClick={nextSlide}
                aria-label="Next collection"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            <div className="carousel-dots">
              {collections.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${index === currentSlide ? "active" : ""}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="marquee-section">
        <div className="marquee-track">
          <div className="marquee-content">
            <span className="marquee-item">✦ Free Shipping on Orders Over $500</span>
            <span className="marquee-item">✦ 30-Day Money Back Guarantee</span>
            <span className="marquee-item">✦ Exclusive Member Discounts</span>
            <span className="marquee-item">✦ Authenticity Certified</span>
            <span className="marquee-item">✦ Free Shipping on Orders Over $500</span>
            <span className="marquee-item">✦ 30-Day Money Back Guarantee</span>
            <span className="marquee-item">✦ Exclusive Member Discounts</span>
            <span className="marquee-item">✦ Authenticity Certified</span>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="metrics-section">
        <div className="container">
          <div className="metrics-grid">
            {metrics.map((item) => (
              <article className="metric-card" key={item.title}>
                <div className="metric-value">{item.value}</div>
                <h3 className="metric-title">{item.title}</h3>
                <p className="metric-desc">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <span className="cta-eyebrow">Private Client Service</span>
              <h2 className="cta-title">Elevate your style with pieces built to last.</h2>
              <p className="cta-desc">
                Join a growing list of customers who trust Kyklos for premium quality and
                concierge-level support.
              </p>
            </div>
            <button className="cta-button" onClick={() => navigate("/shop")}>
              Shop Now
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
