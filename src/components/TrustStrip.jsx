import React, { useEffect, useRef, useState } from "react";
import "./TrustStrip.css";

const VALUE_ITEMS = [
  {
    num: "01",
    title: "Premium Build",
    text: "Heavyweight cotton with refined finishing and lasting structure.",
    icon: (
      <svg viewBox="0 0 24 24" className="ts-svg">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Spiritual Identity",
    text: "Culture-inspired modern silhouettes crafted for self-expression.",
    icon: (
      <svg viewBox="0 0 24 24" className="ts-svg">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Fast Dispatch",
    text: "Quick delivery within 48 hours with secure, tracked packaging.",
    icon: (
      <svg viewBox="0 0 24 24" className="ts-svg">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
];

function TsCard({ item, index }) {
  const cardRef = useRef(null);
  const iconRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [ripples, setRipples] = useState([]);

  /* ── Scroll reveal (IntersectionObserver) ── */
  useEffect(() => {
    const el = cardRef.current;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Click ripple ── */
  const handleClick = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
  };

  return (
    <article
      ref={cardRef}
      className={`ts-card ${revealed ? "ts-card--revealed" : ""}`}
      style={{ transitionDelay: `${index * 120}ms` }}
      onClick={handleClick}
    >
      {/* ripple layer */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ts-ripple"
          style={{ left: r.x, top: r.y }}
        />
      ))}

      <div className="ts-icon-wrap">
        {item.icon}
      </div>

      <div className="ts-body">
        <p className="ts-num">{item.num}</p>
        <h4 className="ts-title">{item.title}</h4>
        <p className="ts-text">{item.text}</p>
      </div>
    </article>
  );
}

export default function TrustStrip() {
  return (
    <section className="ts-section">
      <div className="ts-inner">
        {VALUE_ITEMS.map((item, i) => (
          <TsCard key={item.num} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
