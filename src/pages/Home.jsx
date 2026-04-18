import React, { useEffect, useRef, useState } from "react";
import { FaLeaf, FaMedal, FaShippingFast, FaStar } from "react-icons/fa";
import HeroSlider from "../components/HeroSlider";
import ProductQuickViewModal from "../components/ProductQuickViewModal";
import CategoryItems from "../components/CategoryItems";
import TrendingNow from "../components/TrendingNow";
import "./Home.css";

const STAT_TARGETS = [2400, 49, 5100, 98];

function Home({ tshirts = [], addToCart, wishlist = [], toggleWishlist, isWishlistPending }) {
  const [quickProduct, setQuickProduct] = useState(null);
  const isWishlisted = (product) => wishlist.some((item) => String(item.id) === String(product?.id));

  const valuePills = [
    { icon: <FaMedal />, title: "Premium Build", text: "Heavyweight cotton, crafted finishes." },
    { icon: <FaLeaf />, title: "Spiritual Identity", text: "Culture-inspired modern silhouettes." },
    { icon: <FaShippingFast />, title: "Fast Dispatch", text: "Quick shipping with safe packaging." },
  ];

  const reviews = [
    {
      name: "Arjun M.",
      location: "Mumbai",
      rating: 5,
      text: "Absolutely premium quality. The oversized tee fits perfectly and the fabric is super heavyweight. Will order again!",
      initials: "AM",
      color: "#6366f1",
    },
    {
      name: "Priya K.",
      location: "Bengaluru",
      rating: 5,
      text: "Loved the packaging and the hoodie. Feels like a luxury brand at a fair price. Fast delivery too!",
      initials: "PK",
      color: "#ec4899",
    },
    {
      name: "Rahul S.",
      location: "Delhi",
      rating: 5,
      text: "The zip sweatshirt is insane quality. Stitching is perfect and the spiritual design is unique. Highly recommend.",
      initials: "RS",
      color: "#14b8a6",
    },
    {
      name: "Sneha V.",
      location: "Chennai",
      rating: 5,
      text: "Got two pieces as gifts. Both recipients were amazed by the quality. LeosTrend is now our go-to brand.",
      initials: "SV",
      color: "#f59e0b",
    },
  ];

  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [statCounts, setStatCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return undefined;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return undefined;

    const DURATION = 2200;
    const FPS = 30;
    const FRAME_MS = 1000 / FPS;
    let startTs = 0;
    let lastTickTs = 0;
    let rafId = 0;

    const step = (ts) => {
      if (!startTs) startTs = ts;

      if (ts - lastTickTs < FRAME_MS) {
        rafId = requestAnimationFrame(step);
        return;
      }

      lastTickTs = ts;
      const t = Math.min((ts - startTs) / DURATION, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const nextCounts = STAT_TARGETS.map((n) => Math.round(ease * n));

      setStatCounts((prev) => {
        const unchanged = prev.every((v, i) => v === nextCounts[i]);
        return unchanged ? prev : nextCounts;
      });

      if (t < 1) rafId = requestAnimationFrame(step);
      else setStatCounts([...STAT_TARGETS]);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [statsVisible]);

  return (
    <div className="home-premium">
      <HeroSlider />

      <div className="home-content-wrapper">
        {/* ── Trust Strip ─────────────────────────────────────── */}
        <section className="trust-strip">
          {valuePills.map((item, i) => (
            <article
              key={item.title}
              className="trust-item observe-reveal"
              style={{ "--reveal-delay": `${i * 80}ms` }}
            >
              <span className="trust-icon">{item.icon}</span>
              <div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </section>

        {/* ── Shop by Category ────────────────────────────────── */}
        <section className="home-section-block" style={{ marginTop: "96px" }}>
          <div className="home-section-head text-center observe-reveal">
            <p className="home-section-kicker">Curated Collections</p>
            <h2 className="home-section-title">Shop by Category</h2>
            <p className="home-section-subtitle">
              Discover elevated essentials designed for modern everyday wear.
            </p>
          </div>

          <CategoryItems />
        </section>

        <TrendingNow products={tshirts} onQuickView={setQuickProduct} />
      </div>

      {/* ══ Trust Ticker ═════════════════════════════════════════ */}
      <div className="trust-ticker" aria-label="Our promises">
        <div className="trust-ticker-row">
          <div className="trust-ticker-track" aria-hidden="true">
            {[
              "✦ Free Shipping ₹999+",
              "✦ 7-Day Easy Returns",
              "✦ 100% Authentic Quality",
              "✦ COD Available",
              "✦ Secure Payments",
              "✦ Handpicked Fabrics",
              "✦ Express Dispatch",
              "✦ Free Shipping ₹999+",
              "✦ 7-Day Easy Returns",
              "✦ 100% Authentic Quality",
              "✦ COD Available",
              "✦ Secure Payments",
              "✦ Handpicked Fabrics",
              "✦ Express Dispatch",
            ].map((item, i) => (
              <span key={i} className="trust-ticker-item">{item}</span>
            ))}
          </div>
        </div>
        <div className="trust-ticker-row" aria-hidden="true">
          <div className="trust-ticker-track trust-ticker-track--reverse">
            {[
              "★ 2,400+ Happy Customers",
              "★ 5-Star Rated Brand",
              "★ 98% Satisfaction Rate",
              "★ Premium Cotton Fabrics",
              "★ Ethically Crafted",
              "★ Ships Across India",
              "★ Wear Your Identity",
              "★ 2,400+ Happy Customers",
              "★ 5-Star Rated Brand",
              "★ 98% Satisfaction Rate",
              "★ Premium Cotton Fabrics",
              "★ Ethically Crafted",
              "★ Ships Across India",
              "★ Wear Your Identity",
            ].map((item, i) => (
              <span key={i} className="trust-ticker-item">{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ══ Brand Impact Stats ═══════════════════════════════════ */}
      <section className="brand-impact-section" ref={statsRef}>
        <div className="home-content-wrapper">
          <p className="brand-impact-eyebrow">The Numbers</p>
          <div className="brand-impact-grid">
            <div className="brand-impact-stat">
              <span className="brand-impact-num" style={{ "--stat-accent": "#f59e0b" }}>
                {statCounts[0].toLocaleString("en-IN")}
                <span className="brand-impact-suffix">+</span>
              </span>
              <div className="brand-impact-rule" style={{ "--stat-accent": "#f59e0b" }} aria-hidden="true" />
              <span className="brand-impact-label">Happy Customers</span>
            </div>
            <div className="brand-impact-stat">
              <span className="brand-impact-num" style={{ "--stat-accent": "#ec4899" }}>
                {(statCounts[1] / 10).toFixed(1)}
                <span className="brand-impact-suffix"> ★</span>
              </span>
              <div className="brand-impact-rule" style={{ "--stat-accent": "#ec4899" }} aria-hidden="true" />
              <span className="brand-impact-label">Average Rating</span>
            </div>
            <div className="brand-impact-stat">
              <span className="brand-impact-num" style={{ "--stat-accent": "#22d3ee" }}>
                {statCounts[2].toLocaleString("en-IN")}
                <span className="brand-impact-suffix">+</span>
              </span>
              <div className="brand-impact-rule" style={{ "--stat-accent": "#22d3ee" }} aria-hidden="true" />
              <span className="brand-impact-label">Orders Delivered</span>
            </div>
            <div className="brand-impact-stat">
              <span className="brand-impact-num" style={{ "--stat-accent": "#a3e635" }}>
                {statCounts[3]}
                <span className="brand-impact-suffix">%</span>
              </span>
              <div className="brand-impact-rule" style={{ "--stat-accent": "#a3e635" }} aria-hidden="true" />
              <span className="brand-impact-label">Satisfaction Rate</span>
            </div>
          </div>
          <blockquote className="brand-impact-quote">
            &ldquo;Not just clothing&mdash;a statement of who you are.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* ══ Customer Reviews ═════════════════════════════════════ */}
      <section className="reviews-section">
        <div className="home-content-wrapper">
          <div className="home-section-head text-center observe-reveal" style={{ marginBottom: "52px" }}>
            <p className="home-section-kicker">Customer Love</p>
            <h2 className="home-section-title">What People Say</h2>
            <p className="home-section-subtitle">Real orders. Real people. Real experiences.</p>
          </div>

          <div className="swipe-row-wrap">
          <div className="reviews-grid">
            {reviews.map((r, i) => (
              <article
                key={r.name}
                className="review-card observe-reveal"
                style={{ "--reveal-delay": `${i * 100}ms` }}
              >
                <div className="review-stars" aria-label={`${r.rating} out of 5 stars`}>
                  {Array.from({ length: r.rating }).map((_, si) => (
                    <FaStar key={si} />
                  ))}
                </div>
                <p className="review-text">&ldquo;{r.text}&rdquo;</p>
                <div className="review-author">
                  <span
                    className="review-avatar"
                    style={{ background: r.color }}
                    aria-hidden="true"
                  >
                    {r.initials}
                  </span>
                  <div>
                    <p className="review-name">{r.name}</p>
                    <p className="review-location">{r.location}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <span className="swipe-hint-chip" aria-hidden="true">← Swipe →</span>
          </div>
        </div>
      </section>

      <ProductQuickViewModal
        product={quickProduct}
        onClose={() => setQuickProduct(null)}
        onAddToCart={(product) => addToCart(product, "M")}
        isWishlisted={isWishlisted(quickProduct)}
        isWishlistLoading={Boolean(quickProduct && isWishlistPending?.(quickProduct))}
        onToggleWishlist={toggleWishlist}
      />
    </div>
  );
}

export default Home;
