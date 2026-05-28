import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getOptimizedImageUrl } from "../utils/api";
import "./HeroSlider.css";

const SLIDES = [
  { img: "https://i.ibb.co/bjfzLFMD/banner-1.png" },
  { img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1600" },
  { img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1600" },
  { img: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1600" },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 640px)").matches;
  });
  const stripRef = useRef(null);
  const panelImgRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const handleChange = (event) => setIsMobileViewport(event.matches);

    setIsMobileViewport(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const getHeroImage = (img, width) => getOptimizedImageUrl(img, { width, height: 1000 });

  const goTo = (n) => {
    const next = (n + SLIDES.length) % SLIDES.length;
    setCurrent(next);
    if (panelImgRef.current) {
      panelImgRef.current.style.opacity = "0";
      setTimeout(() => {
        if (panelImgRef.current) {
          panelImgRef.current.src = getHeroImage(SLIDES[next].img, 900);
          panelImgRef.current.style.opacity = "1";
        }
      }, 300);
    }
    resetStrip();
  };

  const resetStrip = () => {
    if (!stripRef.current) return;
    stripRef.current.style.transition = "none";
    stripRef.current.style.height = "0%";
    setTimeout(() => {
      if (stripRef.current) {
        stripRef.current.style.transition = "height 5s linear";
        stripRef.current.style.height = "100%";
      }
    }, 50);
  };

  const startAuto = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % SLIDES.length);
    }, 5000);
  };

  useEffect(() => {
    resetStrip();
    startAuto();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    resetStrip();
  }, [current]);

  const handleNav = (dir) => {
    goTo(current + dir);
    startAuto();
  };

  return (
    <section className="hero">

      {/* ── Slides ── */}
      <div className="hero-slider">
        <div className="hero-slide active">
          <img
            src={getHeroImage(SLIDES[current].img, isMobileViewport ? 900 : 1600)}
            alt="LeosTrend collection"
            className="hero-image"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="hero-overlay" />
        </div>
      </div>

      {/* ── Vertical progress strip ── */}
      <div className="slide-strip">
        <div className="slide-strip-fill" ref={stripRef} />
      </div>

      {/* ── Content ── */}
      <div className="hero-content">
        <div className="hero-content-inner">

          <div className="hero-eyebrow">
            <div className="eyebrow-line" />
            <p className="hero-kicker">Spring Capsule 2026</p>
          </div>

          <h1 className="hero-title">
            Elevate Your<br /><em>Everyday Style</em>
          </h1>

          <p className="hero-subtitle">
            Premium oversized t-shirts crafted for comfort, identity, and modern expression.
          </p>

          <div className="hero-actions">
            <Link to="/collection/oversized" className="hero-btn primary">
              <span>Shop Collection</span>
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/about" className="hero-btn secondary">Our Story</Link>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">50+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">48hr</span>
              <span className="stat-label">Fast Dispatch</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">100%</span>
              <span className="stat-label">Premium Fabric</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Right image panel ── */}
      {!isMobileViewport && (
        <div className="hero-image-panel">
          <img
            ref={panelImgRef}
            className="panel-img"
            src={getHeroImage(SLIDES[0].img, 900)}
            alt="Featured look"
            loading="eager"
            decoding="async"
            style={{ transition: "opacity 0.5s ease" }}
          />
          <div className="panel-overlay" />
        </div>
      )}

      {/* ── Nav: prev · dots · next ── */}
      <div className="hero-nav">
        <button className="hero-arrow" onClick={() => handleNav(-1)}>‹</button>
        <div className="hero-dots">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              role="button"
              aria-label={`Go to slide ${i + 1}`}
              className={`dot${i === current ? " active" : ""}`}
              onClick={() => { goTo(i); startAuto(); }}
            />
          ))}
        </div>
        <button className="hero-arrow" onClick={() => handleNav(1)}>›</button>
      </div>

      {/* ── Slide counter ── */}
      <div className="hero-counter">
        <strong>{String(current + 1).padStart(2, "0")}</strong>
        <span className="counter-sep"> / </span>
        {String(SLIDES.length).padStart(2, "0")}
      </div>

      {/* ── Float tags ── */}
      <div className="hero-float-tags">
        <span className="float-tag">Limited Drops</span>
        <span className="float-tag">Premium Fabric</span>
        <span className="float-tag">Fast Delivery</span>
      </div>

    </section>
  );
}