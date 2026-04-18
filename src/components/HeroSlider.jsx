import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./HeroSlider.css";

const BANNERS = [
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1600",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1600",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1600",
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1600",
];

function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  };

  return (
    <section className="hero home-cinematic-hero hero-slider-section">
      <div className="hero-orb hero-orb-a" aria-hidden="true" />
      <div className="hero-orb hero-orb-b" aria-hidden="true" />

      <div className="carousel w-full rounded-none">
        {BANNERS.map((banner, index) => (
          <div
            key={banner}
            className={`carousel-slide ${index === currentSlide ? "active" : ""}`}
            aria-hidden={index !== currentSlide}
          >
            <img
              src={banner}
              alt="LeosTrend collection banner"
              className="carousel-image"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}

        <button className="hero-arrow left" onClick={prevSlide} aria-label="Previous banner">
          ‹
        </button>
        <button className="hero-arrow right" onClick={nextSlide} aria-label="Next banner">
          ›
        </button>

        <div className="hero-text hero-panel">
          <div className="relative z-10 text-center">
            <p className="hero-kicker">Spring Capsule 2026</p>
            <h1>LeosTrend</h1>
            <p style={{ marginTop: 4 }}>Modern Spiritual Wear</p>

            <div className="hero-actions">
              <Link to="/collection/oversized" className="hero-btn">
                Shop Collection
              </Link>
              <Link to="/about" className="hero-btn ghost-btn">
                Our Story
              </Link>
            </div>

            <div className="hero-micro-points" aria-hidden="true">
              <span>Limited Drops</span>
              <span>Handpicked Quality</span>
              <span>Fast Dispatch</span>
            </div>
          </div>
        </div>

        <div className="hero-dots" aria-label="Choose hero slide" role="tablist">
          {BANNERS.map((banner, index) => (
            <button
              key={banner}
              type="button"
              className={index === currentSlide ? "dot active" : "dot"}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSlider;
