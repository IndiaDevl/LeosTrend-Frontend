import React, { useEffect, useRef } from "react";
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

/* Duplicated items for the seamless 50% loop */
const MARQUEE_ITEMS = [...VALUE_ITEMS, ...VALUE_ITEMS];

function DesktopCard({ item, index }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("ts-card--revealed");
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <article
      ref={cardRef}
      className="ts-card"
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div className="ts-icon-wrap">{item.icon}</div>
      <div className="ts-body">
        <p className="ts-num">{item.num}</p>
        <h4 className="ts-title">{item.title}</h4>
        <p className="ts-text">{item.text}</p>
      </div>
    </article>
  );
}

function MarqueeCard({ item, index }) {
  return (
    <article className="ts-card" key={index}>
      <div className="ts-icon-wrap">{item.icon}</div>
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

      {/* Desktop — 3-column grid with scroll reveal */}
      <div className="ts-inner-desktop">
        {VALUE_ITEMS.map((item, i) => (
          <DesktopCard key={item.num} item={item} index={i} />
        ))}
      </div>

      {/* Mobile — pure CSS infinite marquee, no JS needed */}
      <div className="ts-marquee-wrapper">
        <div className="ts-marquee-track">
          {MARQUEE_ITEMS.map((item, i) => (
            <MarqueeCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>

    </section>
  );
}