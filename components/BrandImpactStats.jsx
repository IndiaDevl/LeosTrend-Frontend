import React, { useEffect, useRef, useState } from "react";

const STAT_TARGETS = [50, 49, 50, 98];

function BrandImpactStats() {
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
    <section className="brand-impact-section" ref={statsRef}>
      <div className="home-content-wrapper">
        <p className="brand-impact-eyebrow">The Numbers</p>
        <div className="brand-impact-grid">
          <div className="brand-impact-stat">
            <span className="brand-impact-num">
              {statCounts[0].toLocaleString("en-IN")}
              <span className="brand-impact-suffix">+</span>
            </span>
            <div className="brand-impact-rule" aria-hidden="true" />
            <span className="brand-impact-label">Happy Customers</span>
          </div>
          <div className="brand-impact-stat">
            <span className="brand-impact-num">
              {(statCounts[1] / 10).toFixed(1)}
              <span className="brand-impact-suffix"> ★</span>
            </span>
            <div className="brand-impact-rule" aria-hidden="true" />
            <span className="brand-impact-label">Average Rating</span>
          </div>
          <div className="brand-impact-stat">
            <span className="brand-impact-num">
              {statCounts[2].toLocaleString("en-IN")}
              <span className="brand-impact-suffix">+</span>
            </span>
            <div className="brand-impact-rule" aria-hidden="true" />
            <span className="brand-impact-label">Orders Delivered</span>
          </div>
          <div className="brand-impact-stat">
            <span className="brand-impact-num">
              {statCounts[3]}
              <span className="brand-impact-suffix">%</span>
            </span>
            <div className="brand-impact-rule" aria-hidden="true" />
            <span className="brand-impact-label">Satisfaction Rate</span>
          </div>
        </div>
        <blockquote className="brand-impact-quote">
          &ldquo;Not just clothing&mdash;a statement of who you are.&rdquo;
        </blockquote>
      </div>
    </section>
  );
}

export default BrandImpactStats;
