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
    image: "https://images.unsplash.com/photo-1590691820318-8cc33afb725e?w=1800&auto=format&fit=crop",
    title: "Refined Luxury",
    description: "Discover premium timepieces and accessories that define modern elegance.",
  },
  {
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=1800&auto=format&fit=crop",
    title: "Timeless Craft",
    description: "Every piece is a testament to precision engineering and enduring style.",
  },
  {
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1800&auto=format&fit=crop",
    title: "Modern Elegance",
    description: "Curated collections for those who appreciate the finer things in life.",
  },
];

export function Home() {
  const navigate = useNavigate();

  // ✅ HERO STATE
  const [heroIndex, setHeroIndex] = useState(0);

  // ✅ COVERFLOW STATE
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ✅ AUTO SLIDE (CLEAN)
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const current = heroSlides[heroIndex];

  // COVERFLOW CONTROLS
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
              style={{
                transform: `translateX(${offset * 100}%)`,
              }}
              src={slide.image}
              alt={slide.title}
            />
          );
        })}

        <div className="container hero__content">
          <h1 className="hero__title">{current.title}</h1>
          <p className="hero__desc">{current.description}</p>

          <div className="hero__actions">
            <button className="button button--dark" onClick={() => navigate("/shop")}>
              Explore Collection
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
          </div>

          <div className="coverflow-carousel">
            <div className="coverflow-stage">
              {collections.map((collection, index) => (
                <article
                  key={index}
                  className={`coverflow-item ${getItemClass(
                    index,
                    currentSlide,
                    collections.length
                  )}`}
                  onClick={() => {
                    const cls = getItemClass(index, currentSlide, collections.length);
                    if (cls.includes("prev")) prevSlide();
                    else if (cls.includes("next")) nextSlide();
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

              <button className="coverflow-btn coverflow-btn--prev" onClick={prevSlide}>
                ‹
              </button>
              <button className="coverflow-btn coverflow-btn--next" onClick={nextSlide}>
                ›
              </button>
            </div>

            <p className="coverflow-caption">{collections[currentSlide]?.title}</p>

            <div className="carousel-indicators">
              {collections.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-indicator ${
                    index === currentSlide ? "active" : ""
                  }`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
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
              concierge-level support.
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