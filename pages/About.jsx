import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaLeaf,
  FaShippingFast,
  FaMedal,
  FaHandsHelping,
  FaGem,
  FaStar,
  FaTruck,
  FaTrophy
} from "react-icons/fa";
import "./About.css";

function About() {
  const navigate = useNavigate();

  const highlights = [
    {
      title: "Premium Fabric",
      desc: "Heavyweight, ultra-soft, luxury cotton. Crafted for all-day comfort and timeless style.",
      icon: <FaMedal className="icon-black" />
    },
    {
      title: "Spiritual Identity",
      desc: "Design language inspired by Indian symbolism, modern minimalism, and global luxury.",
      icon: <FaLeaf className="icon-black" />
    },
    {
      title: "Trusted Delivery",
      desc: "Lightning-fast, white-glove dispatch with premium packaging across India.",
      icon: <FaShippingFast className="icon-black" />
    },
    {
      title: "Community Driven",
      desc: "Built for visionaries who wear culture with confidence and pride.",
      icon: <FaHandsHelping className="icon-black" />
    }
  ];

  return (
    <div className="about-premium container">
      <div className="page-nav premium-nav">
        <button onClick={() => navigate(-1)}>Back</button>
        <button onClick={() => navigate("/")}>Home</button>
      </div>

      <section className="about-hero-card">
        <div className="hero-copy">
          <p className="about-kicker">Crafted Streetwear</p>
          <h1 className="about-title">About LeosTrend</h1>

          <p className="about-lead">
            LeosTrend blends spirituality with contemporary streetwear.
            <br />
            We build premium, world-class pieces rooted in Indian culture,
            minimal design, and luxury craftsmanship.
          </p>

          {/* ✅ METRICS WITH BLACK ICONS */}
          <div className="about-metrics about-metrics-premium">
            <div className="about-metric-card">
              <FaGem className="metric-icon" />
              <strong className="about-metric-number">50+</strong>
              <span className="about-metric-label">Happy Customers</span>
            </div>

            <div className="about-metric-card">
              <FaStar className="metric-icon" />
              <strong className="about-metric-number">4.99/5</strong>
              <span className="about-metric-label">Average Ratings</span>
            </div>

            <div className="about-metric-card">
              <FaTruck className="metric-icon" />
              <strong className="about-metric-number">24h</strong>
              <span className="about-metric-label">Fast Dispatch</span>
            </div>

            <div className="about-metric-card">
              <FaTrophy className="metric-icon" />
              <strong className="about-metric-number">98%</strong>
              <span className="about-metric-label">Satisfaction</span>
            </div>
          </div>
        </div>

        <div className="about-visual-wrap">
          <img
            src="/dragon-embroidered.webp"
            alt="LeosTrend premium apparel"
            className="about-visual"
          />
        </div>
      </section>

      <section className="about-values">
        <h2>Why People Choose LeosTrend</h2>

        <div className="about-grid">
          {highlights.map((item) => (
            <article key={item.title} className="about-card">
              <div className="about-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-signature">
        <p>
          Every drop follows one promise: keep it premium, keep it meaningful,
          and keep it wearable every day.
        </p>
      </section>
    </div>
  );
}

export default About;